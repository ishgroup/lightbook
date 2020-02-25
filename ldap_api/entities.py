import logging

from .ldap_service import remap_dict, LdapService

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.WARN, format='%(asctime)s %(message)s')


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
    ONLY_ONE_VALUE_FIELDS = ['id', 'name', 'username', 'active', 'company', 'company_role']
    INVERSE_ENTRY_MAPPING = {value: key for key, value in list(ENTRY_MAPPING.items())}

    def __init__(self, person_id=None, attr=None, dn=None, company=None):
        """
        Only one of the first three attributes can be passed
        :param person_id: pass just the uid to load the person from LDAP
        :param attr: pass a dict of attributes to create a new record
        :param dn: pass just the dn to load the person from LDAP
        :param company: optionally pass the company to avoid reloading it
        """
        self.ldap_entry = None
        self.attributes = {}
        self.groups = {}
        self.company = company

        if attr:  # New person
            log.debug("Load new person")
            next_id = LdapService.next_id('uid')
            self.dn = f"uidNumber={next_id},{LdapService.LDAP_BASES['people']}"
            self.ldap_entry = None
            self.set_attributes(attr)

        else:
            if person_id:
                log.debug(f"Load person from uid {person_id}")
                self.dn = f"uidNumber={person_id},{LdapService.LDAP_BASES['people']}"
            if dn:
                log.info(f"Load person from dn {dn}")
                self.dn = dn
            self.ldap_entry = self._get_ldap_entry()
            log.debug(f"Loaded person ldap.")
            if not self.company:
                self.company = self._get_company()
                if not self.company:
                    log.debug(f"Failed to load person company relationship.")

            if self.ldap_entry and self.company and self.company.ldap_entry:
                log.debug(f"Loaded groups.")
                self.attributes = self._inverse_mapping()
                self._parse_groups()
            log.debug(f"Saved attributes.")

    def set_attributes(self, attributes):
        self.attributes = {**self.attributes, **attributes}
        self.save_to_ldap()
        new_company = LdapService.find_company_entry_by_name(attributes['company'])
        if new_company:
            new_company = Company(dn=new_company['dn'])
            if not self.company:
                new_company.add_person(self)
            elif new_company.dn is not self.company.dn:
                self.company.remove_person(self)
                new_company.add_person(self)
            self.company = new_company
        # ADD ldap record to groups:
        if self.company:
            self.attributes['people'] = True
            for name, group in self.company.groups.items():
                if self.attributes[name]:
                    group.add_person(self)
                else:
                    group.remove_person(self)
    def _get_ldap_entry(self):
        return LdapService.get_entry_by_dn(self.dn)

    def _parse_groups(self):
        for name, group in self.company.groups.items():
            if 'memberOf' in self.ldap_entry['attributes']:
                if group.dn in self.ldap_entry['attributes']['memberOf']:
                    self.attributes[name] = True
    def _inverse_mapping(self):
        person = remap_dict(self.ldap_entry['attributes'], Person.ENTRY_MAPPING)
        person['id'] = self.ldap_entry['attributes'].get('uidNumber')
        return person

    def save_to_ldap(self):
        ldap_attributes = remap_dict(self.attributes, Person.INVERSE_ENTRY_MAPPING)
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
            LdapService.add_entry(self.dn, ldap_attributes)
        else:
            # update existing user
            LdapService.modify_ldap_entry(self.ldap_entry, ldap_attributes)
        self.ldap_entry = self._get_ldap_entry()
        if not self.ldap_entry:
            return False

        return True

    def _get_company(self):
        log.info(f"Link person to company")
        if self.ldap_entry:
            if 'memberOf' in self.ldap_entry['attributes']:
                company_dn = ','.join(self.ldap_entry['attributes']['memberOf'][0].split(',')[1:])
                return Company(dn=company_dn)
        return None

    def delete_from_ldap(self):
        return LdapService.delete_ldap_entry(self.dn)


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
    ONLY_ONE_VALUE_FIELDS = ['id', 'name', 'username', 'active', 'company', 'abn']
    INVERSE_ENTRY_MAPPING = {value: key for key, value in list(ENTRY_MAPPING.items())}

    def __init__(self, company_id=None, attributes=None, dn=None):
        self.ldap_entry = None
        self.inverse_mapping = None
        self.groups = {}

        if company_id is None and dn is None:
            next_id = LdapService.next_id('uniqueIdentifier')
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

        self.groups['people'] = Group('people', self)
        for name in Group.GROUPS.keys():
            self.groups[name] = Group(name, self)

    def _get_ldap_entry(self):
        return LdapService.get_entry_by_dn(self.dn)

    def _inverse_mapping(self):
        company = remap_dict(self.ldap_entry['attributes'], Company.ENTRY_MAPPING)
        company['id'] = self.ldap_entry['attributes'].get('uniqueIdentifier')
        return company

    def get_people(self, disabled=False):
        if not self.ldap_entry:
            return None
        else:
            people_group_dn = f'cn=people,{self.ldap_entry["dn"]}'
            people = LdapService.get_entry_by_dn(people_group_dn)
            if not people:
                return None
            members = []
            for dn in people['attributes']['member']:
                person = Person(dn=dn, company=self)
                if not person.attributes:
                    continue
                if 'active' in person.attributes and person.attributes['active'] != disabled:
                    members.append(person.attributes)
            return sorted(members, key=lambda k: k['name'].lower())

    # Add a person to this company
    def add_person(self, person):
        LdapService.add_user_to_group(person.dn, f"cn=people,{self.dn}")

    # Remove a person from this company
    def remove_person(self, person):
        LdapService.remove_user_from_group(person.dn, f"cn=people,{self.dn}")
        for group in self.groups.values():
            group.remove_person(person)

    def save_to_ldap(self):
        ldap_attributes = remap_dict(self.attributes, Company.INVERSE_ENTRY_MAPPING)
        # add new user
        if self.ldap_entry is None:
            if 'objectClass' not in ldap_attributes:
                ldap_attributes['objectClass'] = ['ishOrganisation', 'organization']
            LdapService.add_entry(self.dn, ldap_attributes)
        else:
            # update existing user
            LdapService.modify_ldap_entry(self.ldap_entry, ldap_attributes)
        self.ldap_entry = self._get_ldap_entry()
        return True if self.ldap_entry else False

    def delete_from_ldap(self):
        # To delete a company, all the people and all the groups need to be deleted first
        for name, group in self.groups.items():
            group.delete_from_ldap()
        return LdapService.delete_ldap_entry(self.dn)


class Group:
    # key = react value
    # value = LDAP group
    GROUPS = {
        'approvers': 'approver',
        'auto_add_to_task': 'notifier',
        'unsubscribed': 'unsubscriber',
        'people': 'people'
    }

    def __init__(self, name, company):
        self.dn = f"cn={self.GROUPS[name]},{company.dn}"

    def remove_person(self, person):
        """Remove the person from this group. If this is the last person, remove the whole group"""
        LdapService.remove_user_from_group(person.dn, self.dn)

    def add_person(self, person):
        """Add a person to this group and add te group is it doesn't already exist."""
        LdapService.add_user_to_group(person.dn, self.dn)

    def get_members(self):
        ldap_entry = LdapService.get_entry_by_dn(self.dn)
        if not ldap_entry:
            return None

        return ldap_entry['member'] if 'member' in ldap_entry else None

    def delete_from_ldap(self):
        """Remove a group onlyif it has no members"""
        if not self.get_members():
            return LdapService.delete_ldap_entry(self.dn)
