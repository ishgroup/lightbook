from flask import g

from .entities import Person, Company

class API:

    @staticmethod
    def get_person(person_id):
        person = Person(person_id)
        return person.attributes

    @staticmethod
    def get_people(company_id, only_disabled=False):
        company = Company(company_id)
        return company.get_people(only_disabled)

    @staticmethod
    def get_company(company_id):
        company = Company(company_id)
        return company.attributes

    @staticmethod
    def add_person(attributes):
        p = Person(attr=attributes)
        p.save_to_ldap()
        return p.attributes

    @staticmethod
    def add_company(attributes):
        company = Company(attributes=attributes)
        company.save_to_ldap()
        return company.attributes

    @staticmethod
    def modify_person(person_id, attributes):
        person = Person(person_id)
        person.attributes = {**person.attributes, **attributes}
        return person.save_to_ldap()

    @staticmethod
    def modify_company(company_id, attributes):
        company = Company(company_id)
        company.attributes = {**company.attributes, **attributes}
        return company.save_to_ldap()

    @staticmethod
    def delete_company(company_id):
        company = Company(company_id)
        return company.delete_from_ldap()

    @staticmethod
    def delete_person(person_id):
        person = Person(person_id)
        return person.delete_from_ldap()

    @staticmethod
    def search(name, base, get_disabled=False):
        ldap_service = g.get('ldap_service', None)
        return ldap_service.search(name, base, get_disabled)

