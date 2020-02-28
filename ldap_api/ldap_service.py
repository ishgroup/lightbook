import ldap3
from flask import g
from ldap3 import BASE, SUBTREE, ALL_ATTRIBUTES, MODIFY_ADD, MODIFY_REPLACE
from ldap3.utils.conv import escape_filter_chars as eb

class LdapService:
    SEARCH_LIMIT = 20
    MAX_CREATE_ATTEMPTS = 10

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

    @staticmethod
    def get_entry_by_dn(dn):
        ldap_connection = g.get('ldap_connection')
        ldap_connection.search(search_base=dn,
                               search_scope=ldap3.BASE,
                               search_filter='(objectClass=*)',
                               attributes=ldap3.ALL_ATTRIBUTES,
                               get_operational_attributes=True)
        return ldap_connection.response[0] if ldap_connection.result['result'] == 0 else None

    @staticmethod
    def delete_ldap_entry(dn):
        ldap_connection = g.get('ldap_connection')
        if not LdapService.get_entry_by_dn(dn):
            return True
        ldap_connection.delete(dn)
        if ldap_connection.result['result'] != 0:
            raise Exception(f'remove ldap entry failed: reason: {ldap_connection.result}')
        if LdapService.get_entry_by_dn(dn):
            return False
        return True

    @staticmethod
    def add_user_to_group(user_dn, group_dn):
        ldap_connection = g.get('ldap_connection')
        ldap_connection.search(search_base=group_dn,
                               search_scope=BASE,
                               search_filter='(objectClass=*)',
                               attributes=ALL_ATTRIBUTES)
        group = ldap_connection.response
        if not group:
            LdapService.create_group(group_dn, [user_dn])
            return
        members = group[0]['attributes']['member']
        if user_dn in members:
            return
        members.append(user_dn)
        ldap_connection.modify(group[0]['dn'],
                               {'member': [(MODIFY_REPLACE, members)]
                                })
        if ldap_connection.result['result'] != 0:
            raise Exception(f'add to group failed: reason: {ldap_connection.result}')

    @staticmethod
    def map_ldap_response(ldap_response, base):
        result = []
        for entry in ldap_response:
            result.append(
                remap_dict(entry['attributes'], LdapService.SHORT_INFO[base]))
        return result

    @staticmethod
    def remove_user_from_group(user_dn, group_dn):
        ldap_connection = g.get('ldap_connection')
        ldap_connection.search(search_base=group_dn,
                               search_scope=BASE,
                               search_filter='(objectClass=*)',
                               attributes=ALL_ATTRIBUTES)
        group = ldap_connection.response
        if not group:
            return True
        members = group[0]['attributes']['member']
        if user_dn not in members:
            return True
        else:
            members.remove(user_dn)
            if len(members) == 0:
                LdapService.delete_ldap_entry(group_dn)
                return True
        ldap_connection.modify(group[0]['dn'],
                               {'member': [(MODIFY_REPLACE, members)]
                                })
        if ldap_connection.result['result'] != 0:
            raise Exception(f'add to group failed: reason: {ldap_connection.result}')

    @staticmethod
    def create_group(group_dn, members):
        ldap_connection = g.get('ldap_connection')
        object_class = 'groupOfNames'
        ldap_attributes = {
            'member': members
        }
        ldap_connection.add(group_dn, object_class, ldap_attributes)
        if ldap_connection.result['result'] != 0:
            raise Exception(f'create group failed: reason: {ldap_connection.result}')

    @staticmethod
    def find_company_entry_by_name(name):
        print(f'searching company {name} in ldap')
        ldap_connection = g.get('ldap_connection')
        ldap_connection.search(search_base=LdapService.LDAP_BASES['companies'],
                               search_scope=SUBTREE,
                               search_filter=f'(displayName={eb(name)})',
                               attributes=ALL_ATTRIBUTES)
        return get_first(ldap_connection.response)

    @staticmethod
    def next_id(identifier):
        """
        Get the next uniqueIdentifier available in LDAP
        :param: identifier the type of identifier, either "uid" or "uniqueIdentifier"
        :return: int next value
        """
        ldap_connection = g.get('ldap_connection')
        dn = 'cn=max_{},{}'.format(identifier, LdapService.LDAP_BASES['counts'])

        # Get the maximum value cached in an LDAP attribute
        ldap_connection.search(
            search_base=dn,
            search_scope=ldap3.BASE,
            search_filter='(objectClass=uidObject)',
            attributes=['uid'])
        result = ldap_connection.response
        next_value = int(get_first(result)['attributes']['uid'][0]) + 1

        # Store this next value back to LDAP for the next requestz
        changes = {'uid': [MODIFY_REPLACE, next_value]}
        ldap_connection.modify(dn, changes)
        return next_value

    @staticmethod
    def find_person(uid_number):
        person_dn = f"uidNumber={uid_number},{LdapService.LDAP_BASES['people']}"
        return LdapService.get_entry_by_dn(person_dn)

    @staticmethod
    def find_company(unique_identifier):
        company_dn = f"uidNumber={unique_identifier},{LdapService.LDAP_BASES['companies']}"
        return LdapService.get_entry_by_dn(company_dn)

    @staticmethod
    def modify_ldap_entry(entry, attributes):
        ldap_connection = g.get('ldap_connection')
        dn = entry['dn']
        existing_attributes = entry['attributes']
        changes = {}
        for key, value in attributes.items():
            if key in existing_attributes:
                changes[key] = [(MODIFY_REPLACE, value)]
            elif type(value) in (list, str, bytes) and len(value) == 0:
                pass
            else:
                changes[key] = [(MODIFY_ADD, value)]
        ldap_connection.modify(dn, changes=changes)
        if ldap_connection.result['result'] != 0:
            raise Exception(f'update failed: reason: {ldap_connection.result}')

    @staticmethod
    def add_entry(dn, ldap_attributes):
        ldap_connection = g.get('ldap_connection')
        ldap_attributes = filter_blank_attributes(ldap_attributes)
        ldap_connection.add(dn, attributes=ldap_attributes)
        if ldap_connection.result['result'] != 0:
            print(f'Add ldap entry error {ldap_connection.result}')

    @staticmethod
    def search(name, base, get_disabled):
        name = eb(name)
        ldap_connection = g.get('ldap_connection')
        if base == 'companies':
            ldap_filter = f'displayName=*{name}*'
        elif ' ' in name:
            ldap_filter = f'|(displayName~={name})(displayName={name}*)'
        else:
            ldap_filter = f'|(displayName~={name})(cn={name}*)(sn={name}*)(mail={name})'

        if not get_disabled:
            ldap_filter = '(&(active=TRUE)(%s))' % ldap_filter

        ldap_connection.search(search_base=LdapService.LDAP_BASES[base], search_scope=ldap3.SUBTREE,
                               search_filter=ldap_filter,
                               attributes=ldap3.ALL_ATTRIBUTES, paged_size=LdapService.SEARCH_LIMIT,
                               paged_cookie='')

        if not ldap_connection.response:
            return []
        search_response = LdapService.map_ldap_response(ldap_connection.response, base)
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
