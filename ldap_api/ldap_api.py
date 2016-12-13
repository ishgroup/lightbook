import re
import os
import hashlib
import ldap
from ldap.controls import SimplePagedResultsControl


class LdapApi:
    SEARCH_LIMIT = 20
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
            'uid': 'username',
            'o': 'company'
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
        """
        Get a person record
        :param person_id: the person uid
        :return: the person if it exists, or none if it doesn't
        """
        ldap_response = self.__find_person(person_id)
        if ldap_response is None:
            return None

        result = self.__extract_value_from_array(self.__person_from_ldap(ldap_response[1]))
        result['auto_add_to_task'] = self.__get_auto_add_to_task(ldap_response)

        return result

    def get_company(self, company_id):
        """
        Get a company record
        :param company_id:  the company unique identifier
        :return: the company if it exists, or none if it doesn't
        """
        ldap_response = self.__find_company(company_id)
        return self.__extract_value_from_array(self.__company_from_ldap(ldap_response[1])) if ldap_response else None

    def get_people(self, company_id):
        """
        Get all the people attached to this company
        :param company_id: the company unique identifier
        :return: list of people sorted by name
        """
        company = self.__find_company(company_id)
        if company is None:
            return None
        company_name = company[1].get('cn')[0]
        ldap_filter = '(&(o=%s)(active=TRUE))' % company_name

        ldap_response = self.__ldap_client.search_ext_s(self.LDAP_BASES['people'],
                                                        ldap.SCOPE_SUBTREE, ldap_filter)

        if ldap_response is None:
            return []
        people = map(lambda x: self.__extract_value_from_array(self.__remap_dict(x[1], self.SHORT_INFO['people'])),
                     ldap_response)

        return sorted(people, key=lambda k: k['name'].lower())

    def get_employee_dn_by_uid(self, uid):
        """
        Search for an employee by their uid
        :param uid:
        :return: the dn of the employee or None if not found
        """
        ldap_filter = '(uid={})'.format(uid)
        ldap_response = self.__ldap_client.search_ext_s(self.LDAP_BASES['employees'],
                                                        ldap.SCOPE_SUBTREE, ldap_filter)

        return None if ldap_response is None or len(ldap_response) == 0 else ldap_response[0][0]

    def search(self, name, base, get_disabled=False):
        """
        Return a list of results, searching by name
        :param name: the string to search for
        :param base: the string "people" or "companies" to choose the base of what we are searching for
        :param get_disabled: true if we are going to find non-active users as well
        :return:
        """
        ldap_filter = '(cn~=%s)' % name
        if not get_disabled:
            ldap_filter = '(&%s(active=TRUE))' % ldap_filter

        ldap_response = self.__ldap_client.search_ext_s(self.LDAP_BASES[base],
                                                        ldap.SCOPE_SUBTREE, ldap_filter,
                                                        serverctrls=[self.__ldap_page_ctrl()])

        if ldap_response is None:
            return []
        return map(lambda x: self.__extract_value_from_array(self.__remap_dict(x[1], self.SHORT_INFO[base])),
                   ldap_response)

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
        notify = self.__find_notify(dn)
        if notify:
            self.__ldap_client.delete_s(notify[0])

        self.__ldap_client.delete_s(dn)
        return True if self.get_company(company_id) is None else False

    def delete_person(self, person_id):
        dn = 'uidNumber={},{}'.format(person_id, self.LDAP_BASES['people'])
        self.__ldap_client.delete_s(dn)
        return True if self.get_person(person_id) is None else False

    def add_person(self, attributes):
        ldap_attributes = self.__remap_dict(attributes, self.INVERSE_ENTRY_MAPPING)
        ldap_attributes['objectClass'] = self.OBJECT_CLASSES['people']
        names = ldap_attributes['cn'].split(' ', 1)
        if len(names) > 1:
            ldap_attributes['givenName'] = names[0]
            ldap_attributes['sn'] = names[1]
        else:
            ldap_attributes['sn'] = ldap_attributes['cn']
            ldap_attributes['givenName'] = ldap_attributes['cn']

        ldap_attributes['userPassword'] = self.__hash_password(attributes.get('password', ''))

        need_auto_add_to_task = False
        if 'auto_add_to_task' in attributes and attributes['auto_add_to_task']:
            attributes.pop('auto_add_to_task')
            if 'company' in attributes:
                need_auto_add_to_task = True

        if 'active' not in ldap_attributes:
            ldap_attributes['active'] = 'TRUE'

        create_attempts = 0
        person_id = None
        while create_attempts < self.MAX_CREATE_ATTEMPTS:
            try:
                person_id = self.__get_next_uid()
                dn = 'uidNumber={},{}'.format(person_id, self.LDAP_BASES['people'])

                self.__add_entry(dn, ldap_attributes)
                break
            except ldap.ALREADY_EXISTS:
                create_attempts += 1
                if create_attempts == self.MAX_CREATE_ATTEMPTS:
                    raise

        if need_auto_add_to_task:
            self.__set_notify_for(dn, attributes['company'])

        return self.get_person(person_id)

    def add_company(self, attributes):
        ldap_attributes = self.__remap_dict(attributes, self.INVERSE_ENTRY_MAPPING)
        ldap_attributes['objectClass'] = self.OBJECT_CLASSES['companies']
        ldap_attributes['o'] = ldap_attributes['cn']
        create_attempts = 0

        if 'active' not in ldap_attributes:
            ldap_attributes['active'] = 'TRUE'

        company_id = None
        while create_attempts < self.MAX_CREATE_ATTEMPTS:
            try:
                company_id = self.__get_next_unique_identifier()
                dn = 'uniqueIdentifier={},{}'.format(company_id, self.LDAP_BASES['companies'])
                self.__add_entry(dn, ldap_attributes)
                break
            except ldap.ALREADY_EXISTS:
                create_attempts += 1
                if create_attempts >= self.MAX_CREATE_ATTEMPTS:
                    raise

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
        return __get_first(response)

    def __find_company_entry_by_name(self, name):
        ldap_filter = '(cn={})'.format(name)
        response = self.__ldap_client.search_s(self.LDAP_BASES['companies'], ldap.SCOPE_SUBTREE, ldap_filter)
        return __get_first(response)

    def __get_next_unique_identifier(self):
        """
        Get the next uniqueIdentifier available in LDAP
        :return: int next value
        """
        # Get the maximum value cached in an LDAP attribute
        next_value = self.__get_entry_uid(self.LDAP_BASES['counts'], '(cn=maxUniqueIdentifier)') + 1

        # Store this next value back to LDAP for the next request
        dn = '{},{}'.format('cn=maxUniqueIdentifier', self.LDAP_BASES['counts'])
        self.__ldap_client.modify_s(dn, [(ldap.MOD_REPLACE, 'uid', self.__clear_param(next_value))])
        return next_value

    def __get_next_uid(self):
        """
        Get the next uid available in LDAP
        :return: int next value
        """
        # Get the maximum value cached in an LDAP attribute
        next_value = self.__get_entry_uid(self.LDAP_BASES['counts'], '(cn=maxUidNumber)') + 1

        # Store this next value back to LDAP for the next request
        dn = '{},{}'.format('cn=maxUidNumber', self.LDAP_BASES['counts'])
        self.__ldap_client.modify_s(dn, [(ldap.MOD_REPLACE, 'uid', self.__clear_param(next_value))])
        return next_value

    def __get_entry_uid(self, base, ldap_filter):
        result = self.__ldap_client.search_s(base, ldap.SCOPE_SUBTREE, ldap_filter, attrlist=['uid'])[0][1]['uid'][0]
        return int(result)

    def __find_person(self, uid_number):
        response = self.__ldap_client.search_s(self.LDAP_BASES['people'], ldap.SCOPE_SUBTREE,
                                               '(uidNumber=%d)' % uid_number)
        return self.__get_first(response)

    def __find_company(self, unique_identifier):
        response = self.__ldap_client.search_s(self.LDAP_BASES['companies'], ldap.SCOPE_SUBTREE,
                                               '(uniqueIdentifier=%d)' % unique_identifier)
        return self.__get_first(response)

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
        ldap_attributes = self.__filter_blank_attributes(ldap_attributes, entry[1])
        modify_list = self.__make_modify_list(ldap_attributes)
        self.__ldap_client.modify_s(dn, modify_list)

    def __filter_blank_attributes(self, new_attributes, old_attributes={}):
        return {k: v for k, v in new_attributes.items() if not self.__skip_attribute(k, v, old_attributes)}

    def __skip_attribute(self, key, value, current_attributes):
        if value is None:
            return True

        if type(value) in (str, unicode, list) and len(value) == 0 and current_attributes.get(key) is None:
            return True

        return False

    def __make_operation(self, attribute):
        key = self.__clear_param(attribute[0])
        value = self.__clear_param(attribute[1])

        if type(value) in (list, str, unicode) and len(value) == 0:
            return ldap.MOD_DELETE, key, None
        else:
            return ldap.MOD_REPLACE, key, value

    def __make_modify_list(self, attributes):
        return map(lambda x: self.__make_operation(x), attributes.items())

    def __add_entry(self, dn, ldap_attributes):
        ldap_attributes = self.__filter_blank_attributes(ldap_attributes)
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
        return SimplePagedResultsControl(True, size=self.SEARCH_LIMIT, cookie='')

    @staticmethod
    def __remap_dict(source_dict, mapping):
        return {mapping[key]: value for key, value in source_dict.items() if key in mapping}

    def __clear_str(self, line):
        return self.SPACES_REGEX.sub(' ', line).strip(' ')

    @staticmethod
    def __get_first(iterable, default=None):
        if iterable:
            for item in iterable:
                return item
        return default

    def __extract_value_from_array(self, attributes_dict):
        for key in self.ONLY_ONE_VALUE_FIELDS:
            value = attributes_dict.get(key)
            if value is not None and len(value) == 1:
                attributes_dict[key] = self.__clear_str(value[0])
        return attributes_dict

    @staticmethod
    def __hash_password(password):
        """
        Take plaintext password and return a hash ready for LDAP
        :param password:
        :return:
        """
        salt = os.urandom(4)
        sha = hashlib.sha1(password)
        sha.update(salt)
        digest_salt_b64 = '{}{}'.format(sha.digest(), salt).encode('base64').strip()
        return '{{SSHA}}{}'.format(digest_salt_b64)
