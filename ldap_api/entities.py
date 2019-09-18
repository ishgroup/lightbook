from flask import g
from .ldap_service import remap_dict, \
    LdapService


class Person:
    ENTRY_MAPPING = {
        'telephoneNumber': 'phone',
        'cn': 'username',
        'displayName': 'name',
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

    def __init__(self, person_id=None, attr=None, dn=None):
        self.ldap_service = g.get('ldap_service', None)
        self.ldap_entry = None
        self.inverse_mapping = None
        self.attributes = {}
        self.ldap_service = g.get('ldap_service', None)

        if attr:
            next_id = self.ldap_service.next_id('uid')
            self.dn = f"uidNumber={next_id},{LdapService.LDAP_BASES['people']}"
            self.ldap_entry = None
            self.attributes = attr

        else:
            if person_id:
                self.dn = f"uidNumber={person_id},{LdapService.LDAP_BASES['people']}"
            if dn:
                self.dn = dn
            self.ldap_entry = self._get_ldap_entry()
            if self.ldap_entry:
                self.attributes = self._inverse_mapping()

        self._set_badges()

    def _get_ldap_entry(self):
        return self.ldap_service.get_entry_by_dn(self.dn)

    def _set_badges(self):
        result = {}
        company = self.get_company()
        if company:
            for option, group in LdapService.GROUPS.items():
                self.attributes[option] = False
                group_dn = f'cn={group},{company["dn"]}'
                if self.ldap_entry and 'memberOf' in self.ldap_entry['attributes']:
                    if group_dn in self.ldap_entry['attributes']['memberOf']:
                        self.attributes[option] = True

    def _inverse_mapping(self):
        person = remap_dict(self.ldap_entry['attributes'], Person.ENTRY_MAPPING)
        person['id'] = self.ldap_entry['attributes'].get('uidNumber')
        return person

    def save_to_ldap(self):
        ldap_attributes = remap_dict(self.attributes, LdapService.INVERSE_ENTRY_MAPPING)
        ldap_attributes['active'] = ldap_attributes.get('active', True)
        # add new user
        if self.ldap_entry is None:
            if 'objectClass' not in ldap_attributes:
                ldap_attributes['objectClass'] = ['ishuser', 'inetOrgPerson']
            if 'userPassword' not in ldap_attributes:
                ldap_attributes['userPassword'] = [b'{SSHA}eNSoDYz8rmEj1310HF4saG17ajctcX/7']
            names = ldap_attributes['displayName'].split()
            if len(names) > 1:
                ldap_attributes['givenName'], ldap_attributes['sn'] = names[:2]
            else:
                ldap_attributes['givenName'] = ldap_attributes['sn'] = ldap_attributes['displayName']
            self.ldap_service.add_entry(self.dn, ldap_attributes)
            company_name = self.attributes['company']
            company = self.ldap_service.find_company_entry_by_name(company_name)
        else:
            # update existing user
            self.ldap_service.modify_ldap_entry(self.ldap_entry, self.attributes)
            company = self.get_company()
        self.ldap_entry = self._get_ldap_entry()
        if not self.ldap_entry:
            return False

        # ADD ldap record to groups:
        self.ldap_service.add_user_to_group(self.dn, f"cn=people,{company['dn']}")
        for option, group in LdapService.GROUPS.items():
            if option in self.attributes:
                if self.attributes[option]:
                    self.ldap_service.add_user_to_group(self.dn, f"cn={group},{company['dn']}")
                else:
                    self.ldap_service.remove_user_from_group(self.dn, f"cn={group},{company['dn']}")

        return True

    def get_company(self):
        if self.ldap_entry:
            if 'memberOf' in self.ldap_entry['attributes']:
                company_dn = ','.join(self.ldap_entry['attributes']['memberOf'][0].split(',')[1:])
                return self.ldap_service.get_entry_by_dn(company_dn)
        return None

    def delete_from_ldap(self):
        return self.ldap_service.delete_ldap_entry(self.dn)


class Company:
    ENTRY_MAPPING = {
        'telephoneNumber': 'phone',
        'cn': 'username',
        'displayName': 'name',
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

    def __init__(self, company_id=None, attributes=None, dn=None):
        self.ldap_entry = None
        self.inverse_mapping = None
        self.ldap_service = g.get('ldap_service', None)
        if company_id is None and dn is None:
            next_id = self.ldap_service.next_id('uniqueIdentifier')
            self.dn = f"uniqueIdentifier={next_id},{LdapService.LDAP_BASES['companies']}"
            self.ldap_entry = None
            self.attributes = attributes
        else:
            if company_id:
                self.dn = f"uniqueIdentifier={company_id},{LdapService.LDAP_BASES['companies']}"
            if dn:
                self.dn = dn
            self.ldap_entry = self._get_ldap_entry()
            if self.ldap_entry:
                self.attributes = self._inverse_mapping()

    def _get_ldap_entry(self):
        return self.ldap_service.get_entry_by_dn(self.dn)

    def _inverse_mapping(self):
        company = remap_dict(self.ldap_entry['attributes'], Company.ENTRY_MAPPING)
        company['id'] = self.ldap_entry['attributes'].get('uniqueIdentifier')
        return company

    def get_people(self, disabled=False):
        if not self.ldap_service:
            return None
        else:
            people_group_dn = f'cn=people,{self.ldap_entry["dn"]}'
            people = self.ldap_service.get_entry_by_dn(people_group_dn)
            if not people:
                return None
            members = []
            for dn in people['attributes']['member']:
                person = Person(dn=dn)
                attributes = person.attributes
                if not attributes:
                    continue
                if 'active' in attributes and attributes['active'] != disabled:
                    members.append(attributes)
            return sorted(members, key=lambda k: k['name'].lower())

    def save_to_ldap(self):
        ldap_attributes = remap_dict(self.attributes, LdapService.INVERSE_ENTRY_MAPPING)
        # add new user
        if self.ldap_entry is None:
            if 'objectClass' not in ldap_attributes:
                ldap_attributes['objectClass'] = ['ishOrganisation', 'organization']
            self.ldap_service.add_entry(self.dn, ldap_attributes)
        else:
            # update existing user
            self.ldap_service.modify_ldap_entry(self.ldap_entry, self.attributes)
        self.ldap_entry = self._get_ldap_entry()
        return True if self.ldap_entry else False

    def delete_from_ldap(self):
        return self.ldap_service.delete_ldap_entry(self.dn)


class Group:
    dn = None
    name = None

    def __init__(self):
        pass

    def remove_person(self, person):
        """Remove the person from this group. If this is the last person, remove the whole group"""

    def add_person(self, person):
        """Add a person to this group and add te group is it doesn't already exist."""
