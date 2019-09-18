import ldap3
from ldap3 import BASE, SUBTREE, ALL_ATTRIBUTES, MODIFY_ADD, MODIFY_REPLACE


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

    def __init__(self, ldap_connection: ldap3.Connection):
        self.ldap_connection = ldap_connection

    def get_entry_by_dn(self, dn):
        try:
            self.ldap_connection.search(search_base=dn,
                                        search_scope=ldap3.BASE,
                                        search_filter='(objectClass=*)',
                                        attributes=ldap3.ALL_ATTRIBUTES,
                                        get_operational_attributes=True)
        except:
            return None
        return self.ldap_connection.response[0] if self.ldap_connection.result['result'] == 0 else None

    @staticmethod
    def map_ldap_response(ldap_response, base):
        result = []
        for entry in ldap_response:
            result.append(
                remap_dict(entry['attributes'], LdapService.SHORT_INFO[base]))
        return result

    def add_user_to_group(self, user_dn, group_dn):
        self.ldap_connection.search(search_base=group_dn,
                                    search_scope=BASE,
                                    search_filter='(objectClass=*)',
                                    attributes=ALL_ATTRIBUTES)
        group = self.ldap_connection.response
        if not group:
            self.create_group(group_dn, [user_dn])
            return
        members = group[0]['attributes']['member']
        if user_dn in members:
            return
        members.append(user_dn)
        self.ldap_connection.modify(group[0]['dn'],
                                    {'member': [(MODIFY_REPLACE, members)]
                                     })
        if self.ldap_connection.result['result'] != 0:
            raise Exception(f'add to group failed: reason: {self.ldap_connection.result}')

    def remove_user_from_group(self, user_dn, group_dn):
        self.ldap_connection.search(search_base=group_dn,
                                    search_scope=BASE,
                                    search_filter='(objectClass=*)',
                                    attributes=ALL_ATTRIBUTES)
        group = self.ldap_connection.response
        if not group:
            return True
        members = group[0]['attributes']['member']
        if user_dn not in members:
            return True
        else:
            members.remove(user_dn)
            if len(members) == 0:
                self.delete_ldap_entry(group_dn)
                return True
        self.ldap_connection.modify(group[0]['dn'],
                                    {'member': [(MODIFY_REPLACE, members)]
                                     })
        if self.ldap_connection.result['result'] != 0:
            raise Exception(f'add to group failed: reason: {self.ldap_connection.result}')

    def create_group(self, group_dn, members):
        objectClass = 'groupOfNames'
        ldap_attributes = {
            'member': members
        }
        self.ldap_connection.add(group_dn, objectClass, ldap_attributes)
        if self.ldap_connection.result['result'] != 0:
            raise Exception(f'create group failed: reason: {self.ldap_connection.result}')

    def find_company_entry_by_name(self, name):
        self.ldap_connection.search(search_base=LdapService.LDAP_BASES['companies'],
                                    search_scope=SUBTREE,
                                    search_filter=f'(displayName={name})',
                                    attributes=ALL_ATTRIBUTES)
        return get_first(self.ldap_connection.response)

    def next_id(self, identifier):
        """
        Get the next uniqueIdentifier available in LDAP
        :param: identifier the type of identifier, either "uid" or "uniqueIdentifier"
        :return: int next value
        """
        dn = 'cn=max_{},{}'.format(identifier, LdapService.LDAP_BASES['counts'])

        # Get the maximum value cached in an LDAP attribute
        self.ldap_connection.search(
            search_base=dn,
            search_scope=ldap3.BASE,
            search_filter='(objectClass=uidObject)',
            attributes=['uid'])
        result = self.ldap_connection.response
        next_value = int(get_first(result)['attributes']['uid'][0]) + 1

        # Store this next value back to LDAP for the next requestz
        changes = {'uid': [MODIFY_REPLACE, next_value]}
        self.ldap_connection.modify(dn, changes)
        return next_value

    def find_person(self, uidNumber):
        person_dn = f"uidNumber={uidNumber},{LdapService.LDAP_BASES['people']}"
        return self.get_entry_by_dn(person_dn)

    def find_company(self, unique_identifier):
        company_dn = f"uidNumber={unique_identifier},{LdapService.LDAP_BASES['companies']}"
        return self.get_entry_by_dn(company_dn)

    def modify_ldap_entry(self, entry, attributes):
        dn = entry['dn']
        new_attributes = remap_dict(attributes, LdapService.INVERSE_ENTRY_MAPPING)
        existing_attributes = entry['attributes']
        changes = {}
        for key, value in new_attributes.items():
            if key in existing_attributes:
                changes[key] = [(MODIFY_REPLACE, value)]
            elif type(value) in (list, str, bytes) and len(value) == 0:
                pass
            else:
                changes[key] = [(MODIFY_ADD, value)]
        self.ldap_connection.modify(dn, changes=changes)
        if self.ldap_connection.result['result'] != 0:
            raise Exception(f'update failed: reason: {self.ldap_connection.result}')

    def add_entry(self, dn, ldap_attributes):
        ldap_attributes = filter_blank_attributes(ldap_attributes)
        self.ldap_connection.add(dn, attributes=ldap_attributes)
        if self.ldap_connection.result['result'] != 0:
            print(f'Add ldap entry error {self.ldap_connection.result}')

    def delete_ldap_entry(self, dn):
        self.ldap_connection.delete(dn)
        if self.get_entry_by_dn(dn):
            return False
        return True

    def search(self, name, base, get_disabled):
        if base == 'companies':
            ldap_filter = f'cn=*{name}*'
        elif ' ' in name:
            ldap_filter = f'|(cn~={name})(cn={name}*)'
        else:
            ldap_filter = f'|(cn~={name})(cn={name}*)(sn={name}*)(mail={name})'

        if not get_disabled:
            ldap_filter = '(&(active=TRUE)(%s))' % ldap_filter

        self.ldap_connection.search(search_base=LdapService.LDAP_BASES[base], search_scope=ldap3.SUBTREE,
                                    search_filter=ldap_filter,
                                    attributes=ldap3.ALL_ATTRIBUTES, paged_size=LdapService.SEARCH_LIMIT,
                                    paged_cookie='')

        if not self.ldap_connection.response:
            return []
        search_response = self.map_ldap_response(self.ldap_connection.response, base)
        return sorted(search_response, key=lambda k: k['name'].lower())


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


def remap_dict(source_dict, mapping):
    return {mapping[key]: value for key, value in source_dict.items() if key in mapping}


def get_first(iterable, default=None):
    if iterable:
        for item in iterable:
            return item
    return default
