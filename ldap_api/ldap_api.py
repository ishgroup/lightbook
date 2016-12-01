import re
import ldap
from ldap.controls import SimplePagedResultsControl


class LdapApi:
    SIZELIMIT = 10
    SPACES_REGEX = re.compile(r"\s+", re.IGNORECASE)
    ENTRY_MAPPING = {
        'telephoneNumber': 'phone',
        'uniqueIdentifier': 'username',
        'cn': 'name',
        'title': 'company_role',
        'facsimileTelephoneNumber': 'fax',
        'o': 'company',
        'mobile': 'mobile',
        'abn': 'abn',
        'active': 'active',
        'description': 'notes'
    }
    SHORT_INFO = {
        'people': {
            'uidNumber': 'id',
            'cn': 'name',
            'uniqueIdentifier': 'username'
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
        'companies': 'ou=Companies,dc=ish,dc=com,dc=au'
    }

    def __init__(self, url, login='', password=''):
        self.__ldap_client = ldap.initialize(url)
        self.__ldap_client.simple_bind_s(login, password)

    def get_person(self, person_id):
        ldap_response = self.__find_person(person_id)
        return self.__extract_value_from_array(self.__person_from_ldap(ldap_response[1])) if ldap_response else None

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

    # private

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

    def __clear_param(self, param, first_level=True):
        if not first_level:
            return None
        if type(param) is list:
            return map(lambda x: self.__clear_param(x), param)
        elif type(param) is unicode:
            return param.encode('ascii', 'ignore')
        elif type(param) is str:
            return param
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
