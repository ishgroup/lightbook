import os
import hashlib
import ldap
import ldap.filter
from ldap.controls import SimplePagedResultsControl


class LdapService:
    SEARCH_LIMIT = 20
    MAX_CREATE_ATTEMPTS = 10
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
        'postalCode': 'postalCode',
        'street': 'street',
        'st': 'state'
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
        'counts': 'cn=counts,dc=ish,dc=com,dc=au'
    }

    OBJECT_CLASSES = {
        'people': ['ishuser', 'inetOrgPerson'],
        'companies': ['ishOrganisation', 'organization'],
        'role': 'organizationalRole'
    }

    def __init__(self, ldap_connection):
        self.ldap_connection = ldap_connection

    def get_person(self, person_id):
        """
        Get a person record
        :param person_id: the person uid
        :return: the person if it exists, or none if it doesn't
        """
        ldap_response = self.__find_person(person_id)
        if ldap_response is None:
            return None

        result = extract_value_from_array(person_from_ldap(ldap_response[1]))
        result['auto_add_to_task'] = self.__get_auto_add_to_task(ldap_response)

        if result.get('company'):
            company = self.__find_company_entry_by_name(result.get('company'))
            if company:
                result['company_id'] = company[1]['uniqueIdentifier'][0]

        return result

    def get_company(self, company_id):
        """
        Get a company record
        :param company_id:  the company unique identifier
        :return: the company if it exists, or none if it doesn't
        """
        ldap_response = self.__find_company(company_id)
        return extract_value_from_array(company_from_ldap(ldap_response[1])) if ldap_response else None

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
        ldap_filter = ldap.filter.filter_format('(&(o=%s)(active=TRUE))', [company_name])
        ldap_response = self.ldap_connection.search_ext_s(LdapService.LDAP_BASES['people'],
                                                          ldap.SCOPE_SUBTREE, ldap_filter)

        if ldap_response is None:
            return []
        people = map(lambda x: extract_value_from_array(remap_dict(x[1], LdapService.SHORT_INFO['people'])),
                     ldap_response)

        return sorted(people, key=lambda k: k['name'].lower())

    def search(self, name, base, get_disabled=False):
        """
        Return a list of results, searching by name
        :param name: the string to search for
        :param base: the string "people" or "companies" to choose the base of what we are searching for
        :param get_disabled: true if we are going to find non-active users as well
        :return:
        """
        ldap_filter = ldap.filter.filter_format('(cn~=%s)', [name])
        if not get_disabled:
            ldap_filter = '(&%s(active=TRUE))' % ldap_filter

        paged_control = SimplePagedResultsControl(True, size=LdapService.SEARCH_LIMIT, cookie='')
        ldap_response = self.ldap_connection.search_ext_s(
            LdapService.LDAP_BASES[base], ldap.SCOPE_SUBTREE, ldap_filter, serverctrls=[paged_control])

        if ldap_response is None:
            return []
        return map(lambda x: extract_value_from_array(remap_dict(x[1], LdapService.SHORT_INFO[base])),
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
        dn = 'uniqueIdentifier={},{}'.format(company_id, LdapService.LDAP_BASES['companies'])
        notify = self.__find_notify(dn)
        if notify:
            self.ldap_connection.delete_s(notify[0])

        self.ldap_connection.delete_s(dn)
        return True if self.get_company(company_id) is None else False

    def delete_person(self, person_id):
        dn = 'uidNumber={},{}'.format(person_id, LdapService.LDAP_BASES['people'])
        self.ldap_connection.delete_s(dn)
        return True if self.get_person(person_id) is None else False

    def add_person(self, attributes):
        ldap_attributes = remap_dict(attributes, LdapService.INVERSE_ENTRY_MAPPING)
        ldap_attributes['objectClass'] = LdapService.OBJECT_CLASSES['people']
        names = ldap_attributes['cn'].split(' ', 1)
        if len(names) > 1:
            ldap_attributes['givenName'] = names[0]
            ldap_attributes['sn'] = names[1]
        else:
            ldap_attributes['sn'] = ldap_attributes['cn']
            ldap_attributes['givenName'] = ldap_attributes['cn']

        ldap_attributes['userPassword'] = hash_password(attributes.get('password', ''))

        need_auto_add_to_task = False
        if 'auto_add_to_task' in attributes and attributes['auto_add_to_task']:
            attributes.pop('auto_add_to_task')
            if 'company' in attributes:
                need_auto_add_to_task = True

        if 'active' not in ldap_attributes:
            ldap_attributes['active'] = 'TRUE'

        create_attempts = 0
        person_id = None
        dn = None
        while create_attempts < LdapService.MAX_CREATE_ATTEMPTS:
            try:
                person_id = self.__next_id('uid')
                dn = 'uidNumber={},{}'.format(person_id, LdapService.LDAP_BASES['people'])

                self.__add_entry(dn, ldap_attributes)
                break
            except ldap.ALREADY_EXISTS:
                create_attempts += 1
                if create_attempts == LdapService.MAX_CREATE_ATTEMPTS:
                    raise

        if need_auto_add_to_task:
            self.__set_notify_for(dn, attributes['company'])

        return self.get_person(person_id)

    def add_company(self, attributes):
        ldap_attributes = remap_dict(attributes, LdapService.INVERSE_ENTRY_MAPPING)
        ldap_attributes['objectClass'] = LdapService.OBJECT_CLASSES['companies']
        ldap_attributes['o'] = ldap_attributes['cn']
        create_attempts = 0

        if 'active' not in ldap_attributes:
            ldap_attributes['active'] = 'TRUE'

        company_id = None
        while create_attempts < LdapService.MAX_CREATE_ATTEMPTS:
            try:
                company_id = self.__next_id('uniqueIdentifier')
                dn = 'uniqueIdentifier={},{}'.format(company_id, LdapService.LDAP_BASES['companies'])
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

        modify_list = [(ldap.MOD_REPLACE, clear_param('roleOccupant'), clear_param(role_occupants))]
        dn = notify[0]
        return self.ldap_connection.modify_s(dn, modify_list)

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
            return self.ldap_connection.delete_s(notify[0])

        modify_list = [(ldap.MOD_REPLACE, clear_param('roleOccupant'), clear_param(role_occupants))]
        dn = notify[0]
        return self.ldap_connection.modify_s(dn, modify_list)

    def __create_notify(self, user_dn, company_dn):
        dn = 'cn=notify,{}'.format(company_dn)
        ldap_attributes = {
            'objectClass': LdapService.OBJECT_CLASSES['role'],
            'roleOccupant': user_dn
        }
        return self.__add_entry(dn, ldap_attributes)

    def __find_notify(self, company_dn):
        ldap_filter = '(cn=notify)'
        response = self.ldap_connection.search_s(company_dn, ldap.SCOPE_SUBTREE, ldap_filter)
        return get_first(response)

    def __find_company_entry_by_name(self, name):
        ldap_filter = ldap.filter.filter_format('(cn=%s)', [name])
        response = self.ldap_connection.search_s(LdapService.LDAP_BASES['companies'], ldap.SCOPE_SUBTREE, ldap_filter)
        return get_first(response)

    def __next_id(self, identifier):
        """
        Get the next uniqueIdentifier available in LDAP
        :param: identifier the type of identifier, either "uid" or "uniqueIdentifier"
        :return: int next value
        """
        dn = 'cn=max_{},{}'.format(identifier, LdapService.LDAP_BASES['counts'])

        # Get the maximum value cached in an LDAP attribute
        result = self.ldap_connection.search_s(
            dn,
            ldap.SCOPE_BASE,
            '(objectClass=uidObject)',
            attrlist=['uid'])
        next_value = int(get_first(result)[1]['uid'][0]) + 1

        # Store this next value back to LDAP for the next requestz
        self.ldap_connection.modify_s(dn, [(ldap.MOD_REPLACE, 'uid', clear_param(next_value))])
        return next_value

    def __find_person(self, uid_number):
        response = self.ldap_connection.search_s(LdapService.LDAP_BASES['people'], ldap.SCOPE_SUBTREE,
                                                 '(uidNumber=%d)' % uid_number)
        return get_first(response)

    def __find_company(self, unique_identifier):
        response = self.ldap_connection.search_s(LdapService.LDAP_BASES['companies'], ldap.SCOPE_SUBTREE,
                                                 '(uniqueIdentifier=%d)' % unique_identifier)
        return get_first(response)

    def __modify_ldap_entry(self, entry, attributes):
        dn = entry[0]
        ldap_attributes = remap_dict(attributes, LdapService.INVERSE_ENTRY_MAPPING)
        ldap_attributes = filter_blank_attributes(ldap_attributes, entry[1])
        modify_list = map(lambda x: make_operation(x), ldap_attributes.items())
        self.ldap_connection.modify_s(dn, modify_list)

    def __add_entry(self, dn, ldap_attributes):
        ldap_attributes = filter_blank_attributes(ldap_attributes)
        modify_list = map(lambda x: (clear_param(x[0]), clear_param(x[1])), ldap_attributes.items())
        return self.ldap_connection.add_s(dn, modify_list)


def make_operation(attribute):
    key = clear_param(attribute[0])
    value = clear_param(attribute[1])

    if type(value) in (list, str, unicode) and len(value) == 0:
        return ldap.MOD_DELETE, key, None
    else:
        return ldap.MOD_REPLACE, key, value


def skip_attribute(key, value, current_attributes):
    if value is None:
        return True

    if type(value) in (str, unicode, list) and len(value) == 0 and current_attributes.get(key) is None:
        return True

    return False


def filter_blank_attributes(new_attributes, old_attributes=None):
    if old_attributes is None:
        old_attributes = {}
    return {k: v for k, v in new_attributes.items() if not skip_attribute(k, v, old_attributes)}


def company_from_ldap(ldap_dict):
    company = remap_dict(ldap_dict, LdapService.ENTRY_MAPPING)
    company['id'] = ldap_dict.get('uniqueIdentifier')
    return company


def person_from_ldap(ldap_dict):
    person = remap_dict(ldap_dict, LdapService.ENTRY_MAPPING)
    person['id'] = ldap_dict.get('uidNumber')
    return person


def clear_param(param, first_level=True):
    if not first_level:
        return None
    if type(param) is list:
        return map(lambda x: clear_param(x), param)
    elif type(param) is unicode:
        return param.encode('ascii', 'ignore')
    elif type(param) is str:
        return param
    elif type(param) is int:
        return clear_param(str(param))
    else:
        return None


def remap_dict(source_dict, mapping):
    return {mapping[key]: value for key, value in source_dict.items() if key in mapping}


def get_first(iterable, default=None):
    if iterable:
        for item in iterable:
            return item
    return default


def extract_value_from_array(attributes_dict):
    for key in LdapService.ONLY_ONE_VALUE_FIELDS:
        value = attributes_dict.get(key)
        if value is not None and len(value) == 1:
            attributes_dict[key] = value[0].strip(' ')
    return attributes_dict


def hash_password(password):
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
