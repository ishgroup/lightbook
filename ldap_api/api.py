from flask import g

from .ldap_service import convert_to_str, extract_value_from_array, company_from_ldap, person_from_ldap, remap_dict, \
    LdapService, hash_password, decode_dict

import ldap as python_ldap


class API:

    @staticmethod
    def get_person(person_id):
        """
        Get a person record
        :param person_id: the person uid
        :return: the person if it exists, or none if it doesn't
        """
        ldap_service = g.get('ldap_service', None)
        ldap_response = ldap_service.find_person(person_id)
        if ldap_response is None:
            return None

        result = extract_value_from_array(person_from_ldap(ldap_response[1]))
        for option, group in ldap_service.GROUPS.items():
            result[option] = ldap_service.get_group(ldap_response, group)

        if result.get('company'):
            company = ldap_service.find_company_entry_by_name(result.get('company'))
            if company:
                result['company_id'] = company[1]['uniqueIdentifier'][0]

        return convert_to_str(result)

    @staticmethod
    def get_people(company_id, only_disabled=False):
        """
        Get all the people attached to this company
        :param company_id: the company unique identifier
        :param only_disabled: if True return only disabled people
        :return: list of people sorted by name
        """
        ldap_service = g.get('ldap_service', None)
        people = []
        company = ldap_service.find_company(company_id)
        if company is None:
            return None
        ldap_response = ldap_service.ldap_connection.search_ext_s(company[0],
                                                                  python_ldap.SCOPE_SUBTREE, '(cn=people)')
        if not ldap_response:
            return people
        active = 'FALSE' if only_disabled else 'TRUE'
        for member_dn in ldap_response[0][1]['member']:
            entry = ldap_service.get_entry_by_dn(member_dn.decode('utf-8'))
            if entry:
                person = extract_value_from_array(
                    remap_dict(decode_dict(entry[1], 'utf-8'), LdapService.SHORT_INFO['people']))
                if entry[1].get('active', [b'TRUE'])[0].decode('utf-8') == active:
                    for option, group in ldap_service.GROUPS.items():
                        person[option] = ldap_service.get_group(entry, group)
                    people.append(person)

        return convert_to_str(sorted(people, key=lambda k: k['name'].lower()))

    @staticmethod
    def get_company(company_id):
        """
        Get a company record
        :param company_id:  the company unique identifier
        :return: the company if it exists, or none if it doesn't
        """
        ldap_service = g.get('ldap_service', None)
        ldap_response = ldap_service.find_company(company_id)
        return convert_to_str(extract_value_from_array(company_from_ldap(ldap_response[1]))) if ldap_response else None

    @staticmethod
    def add_person(attributes):
        ldap_service = g.get('ldap_service', None)
        ldap_attributes = remap_dict(attributes, LdapService.INVERSE_ENTRY_MAPPING)
        ldap_attributes['objectClass'] = LdapService.OBJECT_CLASSES['people']
        names = ldap_attributes['displayName'].split(' ', 1)
        if len(names) > 1:
            ldap_attributes['givenName'] = names[0]
            ldap_attributes['sn'] = names[1]
        else:
            ldap_attributes['sn'] = ldap_attributes['displayName']
            ldap_attributes['givenName'] = ldap_attributes['displayName']

        ldap_attributes['userPassword'] = hash_password(attributes.get('password', ''))

        add_group_flags = {}
        for option, group in ldap_service.GROUPS.items():
            if option in attributes and attributes[option]:
                attributes.pop(option)
                if 'company' in attributes:
                    add_group_flags[group] = True

        if 'active' not in ldap_attributes:
            ldap_attributes['active'] = 'TRUE'

        create_attempts = 0
        person_id = None
        dn = None
        while create_attempts < LdapService.MAX_CREATE_ATTEMPTS:
            try:
                person_id = ldap_service.next_id('uid')
                dn = 'uidNumber={},{}'.format(person_id, LdapService.LDAP_BASES['people'])

                ldap_service.add_entry(dn, ldap_attributes)
                break
            except python_ldap.ALREADY_EXISTS:
                create_attempts += 1
                if create_attempts == LdapService.MAX_CREATE_ATTEMPTS:
                    raise

        for option, group in ldap_service.GROUPS.items():
            if group in add_group_flags:
                ldap_service.add_user_to_group(dn, attributes['company'], group)

        ldap_service.add_user_to_group(dn, attributes['company'], 'people')
        return API.get_person(person_id)

    @staticmethod
    def add_company(attributes):
        ldap_service = g.get('ldap_service', None)
        ldap_attributes = remap_dict(attributes, LdapService.INVERSE_ENTRY_MAPPING)
        ldap_attributes['objectClass'] = LdapService.OBJECT_CLASSES['companies']
        create_attempts = 0

        if 'active' not in ldap_attributes:
            ldap_attributes['active'] = 'TRUE'

        company_id = None
        while create_attempts < LdapService.MAX_CREATE_ATTEMPTS:
            try:
                company_id = ldap_service.next_id('uniqueIdentifier')
                dn = 'uniqueIdentifier={},{}'.format(company_id, LdapService.LDAP_BASES['companies'])
                ldap_service.add_entry(dn, ldap_attributes)
                break
            except python_ldap.ALREADY_EXISTS:
                create_attempts += 1
                if create_attempts >= ldap_service.MAX_CREATE_ATTEMPTS:
                    raise

        return API.get_company(company_id)

    @staticmethod
    def modify_person(person_id, attributes):
        ldap_service = g.get('ldap_service', None)
        person = ldap_service.find_person(person_id)
        if person is None:
            return None
        old_attributes = convert_to_str(person_from_ldap(person[1]))
        for option, group in ldap_service.GROUPS.items():
            if option in attributes:
                company_name = None
                if 'company' in attributes:
                    company_name = attributes['company']
                elif 'o' in person[1]:
                    company_name = person[1]['o'][0]

                if company_name:
                    if attributes[option]:
                        attributes.pop(option)
                        ldap_service.add_user_to_group(person[0], company_name, group)
                    else:
                        ldap_service.remove_user_from_group(person[0], company_name, group)
                    # if company name changes remove from old company and add it to new company
                    if company_name != old_attributes['company'][0]:
                        ldap_service.add_user_to_group(person[0], company_name, 'people')
                        ldap_service.remove_user_from_group(person[0], old_attributes['company'][0], 'people')

        ldap_service.modify_ldap_entry(person, attributes)
        return API.get_person(person_id)

    @staticmethod
    def modify_company(company_id, attributes):
        ldap_service = g.get('ldap_service', None)
        company = ldap_service.find_company(company_id)
        if company is None:
            return None
        company_name = company[1]['cn'][0].decode('utf-8')

        # find all people from this company and update the company name of each person
        ldap_filter = python_ldap.filter.filter_format('(o=%s)', [company_name])
        staff = ldap_service.ldap_connection.search_s(LdapService.LDAP_BASES['people'], python_ldap.SCOPE_SUBTREE,
                                              ldap_filter)
        if staff:
            for person in staff:
                person_attributes = person_from_ldap(person[1])
                person_attributes['company'] = attributes['name']
                ldap_service.modify_ldap_entry(person, person_attributes)

        ldap_service.modify_ldap_entry(company, attributes)
        return convert_to_str(API.get_company(company_id))

    @staticmethod
    def delete_company(company_id):
        ldap_service = g.get('ldap_service', None)
        dn = 'uniqueIdentifier={},{}'.format(company_id, LdapService.LDAP_BASES['companies'])
        notify = ldap_service.find_group(dn, 'notify')
        if notify:
            ldap_service.ldap_connection.delete_s(notify[0])

        approvers = ldap_service.find_group(dn, 'approvers')
        if approvers:
            ldap_service.ldap_connection.delete_s(approvers[0])

        ldap_service.ldap_connection.delete_s(dn)
        return True if API.get_company(company_id) is None else False

    @staticmethod
    def delete_person(person_id):
        ldap_service = g.get('ldap_service', None)
        dn = 'uidNumber={},{}'.format(person_id, LdapService.LDAP_BASES['people'])

        person = ldap_service.find_person(person_id)

        if 'o' in person[1]:
            company_name = convert_to_str(person[1]['o'][0])
            for group in ldap_service.GROUPS.values():
                ldap_service.remove_user_from_group(person[0], company_name, group)

        ldap_service.ldap_connection.delete_s(dn)
        return True if API.get_person(person_id) is None else False

    @staticmethod
    def search(name, base, get_disabled=False):
        """
        Return a list of results, searching by name
        :param name: the string to search for
        :param base: the string "people" or "companies" to choose the base of what we are searching for
        :param get_disabled: true if we are going to find non-active users as well
        :return:
        """
        ldap_service = g.get('ldap_service', None)
        if base == 'companies':
            ldap_filter = python_ldap.filter.filter_format('cn=*%s*', [name])
        elif ' ' in name:
            ldap_filter = python_ldap.filter.filter_format('|(cn~=%s)(cn=%s*)', [name, name])
        else:
            ldap_filter = python_ldap.filter.filter_format('|(cn~=%s)(cn=%s*)(sn=%s*)(mail=%s)', [name, name, name, name])

        if not get_disabled:
            ldap_filter = '(&(active=TRUE)(%s))' % ldap_filter

        paged_control = python_ldap.controls.SimplePagedResultsControl(True, size=LdapService.SEARCH_LIMIT, cookie='')
        ldap_response = ldap_service.ldap_connection.search_ext_s(
            LdapService.LDAP_BASES[base], python_ldap.SCOPE_SUBTREE, ldap_filter, serverctrls=[paged_control])

        if ldap_response is None:
            return []
        search_response = ldap_service.map_ldap_response(ldap_response, base)
        return convert_to_str(sorted(search_response, key=lambda k: k['name'].lower()))


