import re
import os
import hashlib
import ldap
from ldap.controls import SimplePagedResultsControl


class LdapApi:
    SIZELIMIT = 10
    MAX_CREATE_ATTEMPTS = 10
    SPACES_REGEX = re.compile(r"\s+", re.IGNORECASE)
    ENTRY_MAPPING = {
        'telephoneNumber': 'phone',
        'uid': 'username',
        'cn': 'name',
        'title': 'company_role',
        'facsimileTelephoneNumber': 'fax',
        'o': 'company',
        'mobile': 'mobile',
        'abn': 'abn',
        'active': 'active',
        'description': 'notes',
        'mail': 'email',
        'c': 'country',
        'l': 'suburb',
        'postalAddress': 'address',
        'postalCode': 'postal'
    }
    SHORT_INFO = {
        'people': {
            'uidNumber': 'id',
            'cn': 'name',
            'uid': 'username'
        },
        'companies': {
            'uniqueIdentifier': 'id',
            'cn': 'name'
        }
    }
    ONLY_ONE_VALUE_FIELDS = ['id', 'name', 'username', 'active', 'company', 'abn', 'company_role']
    INVERSE_ENTRY_MAPPING = {value: key for key, value in ENTRY_MAPPING.items()}
    LDAP_BASES = {
        'people': 'ou=Customers,ou=People,dc=ish,dc=com,dc=au',
        'companies': 'ou=Companies,dc=ish,dc=com,dc=au',
        'employees': 'ou=Employees,ou=People,dc=ish,dc=com,dc=au',
        'counts': 'cn=counts,dc=ish,dc=com,dc=au'
    }

    OBJECT_CLASSES = {
        'people': ['ishuser', 'inetOrgPerson'],
        'companies': ['ishOrganisation', 'organization'],
        'role': 'organizationalRole'
    }

    def __init__(self, url, login='', password=''):
        self.__ldap_client = ldap.initialize(url)
        self.__ldap_client.simple_bind_s(login, password)

    def get_person(self, person_id):
        ldap_response = self.__find_person(person_id)
        if ldap_response is None:
            return None

        result = self.__extract_value_from_array(self.__person_from_ldap(ldap_response[1]))
        result['auto_add_to_task'] = self.__get_auto_add_to_task(ldap_response)

        return result

    def get_company(self, company_id):
        ldap_response = self.__find_company(company_id)
        return self.__extract_value_from_array(self.__company_from_ldap(ldap_response[1])) if ldap_response else None

    def get_company_people(self, company_id):
        company = self.__find_company(company_id)
        if company is None:
            return None
        company_name = company[1].get('cn')[0]
        ldap_filter = '(&(o=%s)(active=TRUE))' % company_name

        ldap_response = self.__ldap_client.search_ext_s(self.LDAP_BASES['people'],
                                                        ldap.SCOPE_SUBTREE, ldap_filter)

        if ldap_response is None:
            return []
        people = map(lambda x: self.__extract_value_from_array(self.__remap_dict(x[1], self.SHORT_INFO['people'])), ldap_response)

        return sorted(people, key=lambda k: k['name'].lower())

    def get_employee_dn_by_uid(self, uid):
        ldap_filter = '(uid={})'.format(uid)
        ldap_response = self.__ldap_client.search_ext_s(self.LDAP_BASES['employees'],
                                                        ldap.SCOPE_SUBTREE, ldap_filter)

        return None if ldap_response is None or len(ldap_response) == 0 else ldap_response[0][0]

    def search(self, name, base, get_disabled=False):
        ldap_filter = '(cn~=%s)' % name
        if not get_disabled:
            ldap_filter = '(&%s(active=TRUE))' % ldap_filter

        ldap_response = self.__ldap_client.search_ext_s(self.LDAP_BASES[base],
                                                        ldap.SCOPE_SUBTREE, ldap_filter,
                                                        serverctrls=[self.__ldap_page_ctrl()])

        if ldap_response is None:
            return []
        return map(lambda x: self.__extract_value_from_array(self.__remap_dict(x[1], self.SHORT_INFO[base])), ldap_response)

    def modify_person(self, person_id, attributes):
        person = self.__find_person(person_id)
        if person is None:
            return None

        if 'auto_add_to_task' in attributes:
            company_name = None
            if 'company' in attributes:
                company_name = attributes['company']
            elif 'o' in person[1]:
                company_name = person[1]['o'][0]

            if company_name:
                if attributes['auto_add_to_task']:
                    attributes.pop('auto_add_to_task')
                    self.__set_notify_for(person[0], company_name)
                else:
                    self.__unset_notify_for(person[0], company_name)

        self.__modify_ldap_entry(person, attributes)
        return self.get_person(person_id)

    def modify_company(self, company_id, attributes):
        company = self.__find_company(company_id)
        if company is None:
            return None

        self.__modify_ldap_entry(company, attributes)
        return self.get_company(company_id)

    def delete_company(self, company_id):
        dn = 'uniqueIdentifier={},{}'.format(company_id, self.LDAP_BASES['companies'])
        try:
            notify = self.__find_notify(dn)
            if notify:
                self.__ldap_client.delete_s(notify[0])

            self.__ldap_client.delete_s(dn)
            return True if self.get_company(company_id) is None else False
        except:
            return False

    def delete_person(self, person_id):
        dn = 'uidNumber={},{}'.format(person_id, self.LDAP_BASES['people'])
        try:
            self.__ldap_client.delete_s(dn)
            return True if self.get_person(person_id) is None else False
        except:
            return False

    def add_person(self, attributes):
        ldap_attributes = self.__remap_dict(attributes, self.INVERSE_ENTRY_MAPPING)
        ldap_attributes['objectClass'] = self.OBJECT_CLASSES['people']
        names = ldap_attributes['cn'].split(' ')
        if len(names) > 1:
            ldap_attributes['sn'] = names[0]
            ldap_attributes['givenName'] = names[1]
        else:
            ldap_attributes['sn'] = ldap_attributes['cn']
            ldap_attributes['givenName'] = ldap_attributes['cn']

        ldap_attributes['userPassword'] = self.__make_password(attributes.get('password', ''))

        need_auto_add_to_task = False
        if 'auto_add_to_task' in attributes and attributes['auto_add_to_task']:
            attributes.pop('auto_add_to_task')
            if 'company' in attributes:
                need_auto_add_to_task = True

        create_attempts = 0
        while create_attempts < self.MAX_CREATE_ATTEMPTS - 1:
            try:
                person_id = self.__increase_max_uidNumber()
                dn = 'uidNumber={},{}'.format(person_id, self.LDAP_BASES['people'])

                self.__add_entry(dn, ldap_attributes)
                break
            except ldap.ALREADY_EXISTS:
                create_attempts += 1

        if create_attempts == self.MAX_CREATE_ATTEMPTS - 1:
            self.__add_entry(dn, ldap_attributes)

        if need_auto_add_to_task:
            self.__set_notify_for(dn, attributes['company'])

        return self.get_person(person_id)

    def add_company(self, attributes):
        ldap_attributes = self.__remap_dict(attributes, self.INVERSE_ENTRY_MAPPING)
        ldap_attributes['objectClass'] = self.OBJECT_CLASSES['companies']
        ldap_attributes['o'] = ldap_attributes['cn']
        create_attempts = 0
        while create_attempts < self.MAX_CREATE_ATTEMPTS - 1:
            try:
                company_id = self.__increase_max_uniqueIdentifier()
                dn = 'uniqueIdentifier={},{}'.format(company_id, self.LDAP_BASES['companies'])
                self.__add_entry(dn, ldap_attributes)
                break
            except ldap.ALREADY_EXISTS:
                create_attempts += 1

        if create_attempts == self.MAX_CREATE_ATTEMPTS - 1:
            self.__add_entry(dn, ldap_attributes)

        return self.get_company(company_id)

    # private

    def __get_auto_add_to_task(self, person):
        user_dn = person[0]
        if 'o' not in person[1]:
            return False

        company_name = person[1]['o'][0]
        company = self.__find_company_entry_by_name(company_name)

        if company is None:
            return False

        company_dn = company[0]
        notify = self.__find_notify(company_dn)
        if notify is None:
            return False

        role_occupants = notify[1]['roleOccupant']
        return user_dn in role_occupants

    def __set_notify_for(self, user_dn, company_name):
        company = self.__find_company_entry_by_name(company_name)
        if company is None:
            return None

        company_dn = company[0]
        notify = self.__find_notify(company_dn)
        if notify is None:
            return self.__create_notify(user_dn, company_dn)

        role_occupants = notify[1]['roleOccupant']
        if user_dn in role_occupants:
            return True

        role_occupants.append(user_dn)

        modify_list = [(ldap.MOD_REPLACE, self.__clear_param('roleOccupant'), self.__clear_param(role_occupants))]
        dn = notify[0]
        return self.__ldap_client.modify_s(dn, modify_list)

    def __unset_notify_for(self, user_dn, company_name):
        company = self.__find_company_entry_by_name(company_name)
        if company is None:
            return True

        company_dn = company[0]
        notify = self.__find_notify(company_dn)
        if notify is None:
            return True

        role_occupants = notify[1]['roleOccupant']
        if user_dn not in role_occupants:
            return True

        role_occupants.remove(user_dn)

        if len(role_occupants) == 0:
            return self.__ldap_client.delete_s(notify[0])

        modify_list = [(ldap.MOD_REPLACE, self.__clear_param('roleOccupant'), self.__clear_param(role_occupants))]
        dn = notify[0]
        return self.__ldap_client.modify_s(dn, modify_list)

    def __create_notify(self, user_dn, company_dn):
        dn = 'cn=notify,{}'.format(company_dn)
        ldap_attributes = {
            'objectClass': self.OBJECT_CLASSES['role'],
            'roleOccupant': user_dn
        }
        return self.__add_entry(dn, ldap_attributes)

    def __find_notify(self, company_dn):
        ldap_filter = '(cn=notify)'
        response = self.__ldap_client.search_s(company_dn, ldap.SCOPE_SUBTREE, ldap_filter)
        if response is None or len(response) == 0:
            return None

        return response[0]

    def __find_company_entry_by_name(self, name):
        ldap_filter = '(cn={})'.format(name)
        response = self.__ldap_client.search_s(self.LDAP_BASES['companies'], ldap.SCOPE_SUBTREE, ldap_filter)
        if response is None or len(response) == 0:
            return None

        return response[0]

    def __get_max_uniqueIdentifier(self):
        return self.__get_entry_uid(self.LDAP_BASES['counts'], '(cn=maxUniqueIdentifier)')

    def __increase_max_uniqueIdentifier(self):
        new_max = self.__get_max_uniqueIdentifier() + 1
        dn = '{},{}'.format('cn=maxUniqueIdentifier', self.LDAP_BASES['counts'])
        self.__ldap_client.modify_s(dn, [[ldap.MOD_REPLACE, 'uid', self.__clear_param(new_max)]])
        return new_max

    def __get_max_uidNumber(self):
        return self.__get_entry_uid(self.LDAP_BASES['counts'], '(cn=maxUidNumber)')

    def __increase_max_uidNumber(self):
        new_max = self.__get_max_uidNumber() + 1
        dn = '{},{}'.format('cn=maxUidNumber',self.LDAP_BASES['counts'])
        self.__ldap_client.modify_s(dn, [[ldap.MOD_REPLACE, 'uid', self.__clear_param(new_max)]])
        return new_max

    def __get_entry_uid(self, base, ldap_filter):
        result = self.__ldap_client.search_s(base, ldap.SCOPE_SUBTREE, ldap_filter, attrlist=['uid'])[0][1]['uid'][0]
        return int(result)

    def __find_person(self, uid_number):
        response = self.__ldap_client.search_s(self.LDAP_BASES['people'], ldap.SCOPE_SUBTREE,
                                               '(uidNumber=%d)' % uid_number)
        return self.__get_first_result(response)

    def __find_company(self, unique_identifier):
        response = self.__ldap_client.search_s(self.LDAP_BASES['companies'], ldap.SCOPE_SUBTREE,
                                               '(uniqueIdentifier=%d)' % unique_identifier)
        return self.__get_first_result(response)

    def __person_from_ldap(self, ldap_dict):
        person = self.__remap_dict(ldap_dict, self.ENTRY_MAPPING)
        person['id'] = ldap_dict.get('uidNumber')
        return person

    def __company_from_ldap(self, ldap_dict):
        company = self.__remap_dict(ldap_dict, self.ENTRY_MAPPING)
        company['id'] = ldap_dict.get('uniqueIdentifier')
        return company

    def __modify_ldap_entry(self, entry, attributes):
        dn = entry[0]
        ldap_attributes = self.__remap_dict(attributes, self.INVERSE_ENTRY_MAPPING)
        modify_list = self.__make_modify_list(ldap_attributes)
        self.__ldap_client.modify_s(dn, modify_list)

    def __make_operation(self, attribute):
        key = self.__clear_param(attribute[0])
        value = self.__clear_param(attribute[1])

        if type(value) is list and len(value) == 0:
            return ldap.MOD_DELETE, key, None
        else:
            return ldap.MOD_REPLACE, key, value

    def __make_modify_list(self, attributes):
        return map(lambda x: self.__make_operation(x), attributes.items())

    def __add_entry(self, dn, ldap_attributes):
        modify_list = map(lambda x: (self.__clear_param(x[0]), self.__clear_param(x[1])), ldap_attributes.items())
        return self.__ldap_client.add_s(dn, modify_list)

    def __clear_param(self, param, first_level=True):
        if not first_level:
            return None
        if type(param) is list:
            return map(lambda x: self.__clear_param(x), param)
        elif type(param) is unicode:
            return param.encode('ascii', 'ignore')
        elif type(param) is str:
            return param
        elif type(param) is int:
            return self.__clear_param(str(param))
        else:
            return None

    def __ldap_page_ctrl(self):
        return SimplePagedResultsControl(True, size=self.SIZELIMIT, cookie='')

    def __remap_dict(self, source_dict, mapping):
        return {mapping[key]: value for key, value in source_dict.items() if key in mapping}

    def __clear_str(self, line):
        return self.SPACES_REGEX.sub(' ', line).strip(' ')

    def __get_first_result(self, response):
        return response[0] if response else None

    def __extract_value_from_array(self, attributes_dict):
        for key in self.ONLY_ONE_VALUE_FIELDS:
            value = attributes_dict.get(key)
            if value is not None and len(value) == 1:
                attributes_dict[key] = self.__clear_str(value[0])
        return attributes_dict

    def __make_password(self, password):
        salt = os.urandom(4)
        sha = hashlib.sha1(password)
        sha.update(salt)
        digest_salt_b64 = '{}{}'.format(sha.digest(), salt).encode('base64').strip()
        return '{{SSHA}}{}'.format(digest_salt_b64)
