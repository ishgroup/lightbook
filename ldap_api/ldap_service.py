import hashlib
import os

import ldap as python_ldap
import ldap.filter
from ldap.controls import SimplePagedResultsControl

class LdapService:
    SEARCH_LIMIT = 20
    MAX_CREATE_ATTEMPTS = 10
    ENTRY_MAPPING = {
        'telephoneNumber': 'phone',
        'cn': 'username',
        'displayName': 'name',
        'title': 'company_role',
        'facsimileTelephoneNumber': 'fax',
        'o': 'company',
        'sla': 'sla',
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
            'displayName': 'name',
            'uid': 'username',
            'o': 'company'
        },
        'companies': {
            'uniqueIdentifier': 'id',
            'displayName': 'name'
        }
    }
    ONLY_ONE_VALUE_FIELDS = ['id', 'name', 'username', 'active', 'company', 'abn', 'company_role']
    INVERSE_ENTRY_MAPPING = {value: key for key, value in list(ENTRY_MAPPING.items())}
    LDAP_BASES = {
        'people': 'ou=Customers,ou=People,dc=ish,dc=com,dc=au',
        'companies': 'ou=Companies,dc=ish,dc=com,dc=au',
        'counts': 'cn=counts,dc=ish,dc=com,dc=au'
    }

    OBJECT_CLASSES = {
        'people': ['ishuser', 'inetOrgPerson'],
        'companies': ['ishOrganisation', 'organization'],
        'role': 'groupOfNames'
    }

    GROUPS = {'approvers': 'approver',
              'auto_add_to_task': 'notifier',
              'unsubscribed': 'unsubscriber'}

    def __init__(self, ldap_connection):
        self.ldap_connection = ldap_connection

    def get_entry_by_dn(self, dn):
        try:
            response = self.ldap_connection.search_s(dn, ldap.SCOPE_BASE, '(objectClass=*)')
        except:
            return None
        return response[0] if response else None

    @staticmethod
    def map_ldap_response(ldap_response, base):
        result = []
        for entry in ldap_response:
            result.append(
                extract_value_from_array(remap_dict(decode_dict(entry[1], 'utf-8'), LdapService.SHORT_INFO[base])))
        return result
    # private

    def __get_group(self, person, group_name):
        user_dn, attributes = person
        search_filter = '(member=%s)' % user_dn
        ldap_response = self.ldap_connection.search_ext_s(LdapService.LDAP_BASES['companies'], python_ldap.SCOPE_SUBTREE, search_filter)
        if not ldap_response:
            return False
        group_names = [group['cn'][0].decode('utf-8') for dn, group in ldap_response]
        return group_name in group_names

    def __add_user_to_group(self, user_dn, company_name, group_name):
        company = self.__find_company_entry_by_name(company_name)
        if company is None:
            return None

        company_dn = company[0]
        group = self.__find_group(company_dn, group_name)
        if group is None:
            return self.__create_group(user_dn, company_dn, group_name)

        role_occupants = group[1]['member']
        if user_dn in role_occupants:
            return True

        role_occupants.append(user_dn)
        modify_list = [(python_ldap.MOD_REPLACE, clear_param('member'), clear_param(role_occupants))]
        modify_list = [(item[0], convert_to_str(item[1]), convert_to_bytes(item[2])) for item in modify_list]

        dn = group[0]
        try:
            self.ldap_connection.modify_s(dn, modify_list)
        except python_ldap.TYPE_OR_VALUE_EXISTS:
            pass

    def __remove_user_from_group(self, user_dn, company_name, group_name):
        company = self.__find_company_entry_by_name(company_name)
        if company is None:
            return True

        company_dn = company[0]
        group = self.__find_group(company_dn, group_name)
        if group is None:
            return True

        role_occupants = convert_to_str(group[1]['member'])
        if user_dn not in role_occupants:
            return True
        tmp_role_occupants = list(role_occupants)
        tmp_role_occupants.remove(user_dn)
        role_occupants = tuple(tmp_role_occupants)

        if len(role_occupants) == 0:
            return self.ldap_connection.delete_s(group[0])

        modify_list = [(python_ldap.MOD_REPLACE, clear_param('member'), clear_param(role_occupants))]
        modify_list = [(item[0], convert_to_str(item[1]), convert_to_bytes(item[2])) for item in modify_list]
        dn = group[0]
        return self.ldap_connection.modify_s(dn, modify_list)

    def __create_group(self, user_dn, company_dn, group_name):
        """
        Create a group of users for this company
        :param user_dn:
        :param company_dn:
        :param group_name:
        :return:
        """
        dn = 'cn={},{}'.format(group_name, company_dn)
        ldap_attributes = {
            'objectClass': LdapService.OBJECT_CLASSES['role'],
            'member': user_dn
        }
        return self.__add_entry(dn, ldap_attributes)

    def __find_group(self, company_dn, group_name):
        """
        Return the group of users for the company
        :param company_dn:
        :param group_name:
        :return:
        """
        ldap_filter = '(cn={})'.format(group_name)
        response = self.ldap_connection.search_s(company_dn, python_ldap.SCOPE_SUBTREE, ldap_filter)
        return get_first(response)

    def __find_company_entry_by_name(self, name):
        ldap_filter = python_ldap.filter.filter_format('(displayName=%s)', [name])
        response = self.ldap_connection.search_s(LdapService.LDAP_BASES['companies'], python_ldap.SCOPE_SUBTREE, ldap_filter)
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
            python_ldap.SCOPE_BASE,
            '(objectClass=uidObject)',
            attrlist=['uid'])
        next_value = int(get_first(result)[1]['uid'][0]) + 1

        # Store this next value back to LDAP for the next requestz
        self.ldap_connection.modify_s(dn, [(python_ldap.MOD_REPLACE, 'uid', clear_param(next_value))])
        return next_value

    def __find_person(self, uid_number):
        response = self.ldap_connection.search_s(LdapService.LDAP_BASES['people'], python_ldap.SCOPE_SUBTREE,
                                                 '(uidNumber=%d)' % uid_number)
        return get_first(response)

    def __find_company(self, unique_identifier):
        response = self.ldap_connection.search_s(LdapService.LDAP_BASES['companies'], python_ldap.SCOPE_SUBTREE,
                                                 '(uniqueIdentifier=%d)' % unique_identifier)
        return get_first(response)

    def __modify_ldap_entry(self, entry, attributes):
        dn = entry[0]
        ldap_attributes = remap_dict(attributes, LdapService.INVERSE_ENTRY_MAPPING)
        ldap_attributes = filter_blank_attributes(ldap_attributes, entry[1])
        if 'username' in ldap_attributes:  # set given name and surname if entry is a person
            names = ldap_attributes['cn'].split(' ', 1)
            if len(names) > 1:
                ldap_attributes['givenName'] = names[0]
                ldap_attributes['sn'] = names[1]
            else:
                ldap_attributes['sn'] = ldap_attributes['cn']
                ldap_attributes['givenName'] = ldap_attributes['cn']
        modify_list = [make_operation(x) for x in list(ldap_attributes.items())]
        self.ldap_connection.modify_s(dn, modify_list)

    def __add_entry(self, dn, ldap_attributes):
        ldap_attributes = filter_blank_attributes(ldap_attributes)
        modify_list = [(convert_to_str(clear_param(x[0])), clear_param(x[1])) for x in list(ldap_attributes.items())]
        return self.ldap_connection.add_s(convert_to_str(dn), modify_list)


def make_operation(attribute):
    key = clear_param(attribute[0])
    value = clear_param(attribute[1])

    if type(value) in (list, str, bytes) and len(value) == 0:
        return python_ldap.MOD_DELETE, convert_to_str(key), None
    else:
        return python_ldap.MOD_REPLACE, convert_to_str(key), value


def skip_attribute(key, value, current_attributes):
    if value is None:
        return True

    if type(value) in (str, str, list) and len(value) == 0 and current_attributes.get(key) is None:
        return True

    return False


def filter_blank_attributes(new_attributes, old_attributes=None):
    if old_attributes is None:
        old_attributes = {}
    return {k: v for k, v in list(new_attributes.items()) if not skip_attribute(k, v, old_attributes)}


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
        return [clear_param(x) for x in param]
    elif type(param) is str:
        return param.encode('ascii', 'ignore')
    elif type(param) is str:
        return param
    elif type(param) is int:
        return clear_param(str(param))
    else:
        return param


def remap_dict(source_dict, mapping):
    return {mapping[key]: value for key, value in source_dict.items() if key in mapping}


def get_first(iterable, default=None):
    if iterable:
        for item in iterable:
            return item
    return default


def extract_value_from_array(attributes_dict):
    attributes_dict = {key: [value.decode('utf-8') if isinstance(value, bytes) else value for value in word] for
                       key, word
                       in attributes_dict.items()}
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
    sha = hashlib.sha1(password.encode('utf-8'))
    sha.update(salt)
    import base64
    digest_salt_b64 = base64.b64encode('{}{}'.format(sha.digest(), salt).encode('utf-8')).strip()
    return '{{SSHA}}{}'.format(digest_salt_b64)


def decode_dict(source, charset):
    return {key: [value.decode(charset) for value in word] for key, word in source.items()}


def convert_to_str(var):
    if isinstance(var, tuple) or isinstance(var, list):
        return tuple(convert_to_str(item) for item in var)
    elif isinstance(var, dict):
        return {convert_to_str(key): convert_to_str(value) for key, value in var.items()}
    elif isinstance(var, str):
        return var
    elif isinstance(var, bytes):
        return var.decode('utf-8')
    else:
        return var


def convert_to_bytes(var):
    if isinstance(var, list):
        return list([convert_to_bytes(item) for item in var])
    elif isinstance(var, tuple):
        return tuple((convert_to_bytes(item) for item in var))
    elif isinstance(var, dict):
        return {convert_to_bytes(key): convert_to_bytes(value) for key, value in var.items()}
    elif isinstance(var, str):
        return var.encode()
    elif isinstance(var, bytes):
        return var
    else:
        return var
