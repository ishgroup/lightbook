class Person:
    dn = None
    attributes = {}
    groups = []

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

    def __init__(self, dn=None):
        if dn is None:
            self._set_next_id()

        pass

    def get_company(self):
        pass

    def _set_next_id(self):
        self.dn = 11

    def delete(self):
        pass

    def save(self):
        pass

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

    def __init__(self):
        pass

    def get_active_people(self):
        pass


class Group:
    dn = None
    name = None

    def __init__(self):
        pass

    def remove_person(self, person):
        """Remove the person from this group. If this is the last person, remove the whole group"""

    def add_person(self, person):
        """Add a person to this group and add te group is it doesn't already exist."""