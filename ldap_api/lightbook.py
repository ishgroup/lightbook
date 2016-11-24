import json
import ldap
import os
from ldap.controls import SimplePagedResultsControl

SIZELIMIT = 10

def connect_to_ldap():
  ldap_config = '%s/../ldap.json' % os.path.dirname(os.path.realpath(__file__))

  with open(ldap_config) as data_file:
    ldap_config = json.load(data_file)
  ish_ldap = ldap.initialize(ldap_config['ldap_url'])
  ish_ldap.simple_bind_s('', '')
  return ish_ldap

def compact_dict(dict):
  return { k: v for k, v in dict.items() if not v is None }

def transform_person(ldap_person):
  return {
    'id': ldap_person['uidNumber'][0],
    'name': ldap_person['cn'][0],
    'username': ldap_person['uid'][0],
    'company': ldap_person['o'][0],
    'company_role': ldap_person.get('title', [None])[0],
    'phone': ldap_person.get('telephoneNumber'),
    'notes': ldap_person.get('description', [None])[0],
    'mobile': ldap_person.get('mobile')
  }

def person_to_ldap_attrs(person):
  return compact_dict({
    'uidNumber': person.get('id'),
    'cn': person.get('name'),
    'uid': person.get('username'),
    'o': person.get('company'),
    'title': person.get('company_role'),
    'telephoneNumber': person.get('phone'),
    'description': person.get('notes'),
    'mobile': person.get('mobile')
  })

def transform_company(ldap_company):
  return {
    'id': ldap_company['uniqueIdentifier'][0],
    'name': ldap_company['cn'][0],
    'notes': ldap_company.get('description', [None])[0],
    'fax': ldap_company.get('facsimileTelephoneNumber'),
    'phone': ldap_company.get('telephoneNumber'),
    'mobile': ldap_company.get('mobile'),
    'abn': ldap_company.get('abn', [None])[0],
    'active': ldap_company.get('active', [None])[0]
  }

def company_to_ldap_attrs(company):
  return compact_dict({
    'uniqueIdentifier': company.get('id'),
    'cn': company.get('name'),
    'description': company.get('notes'),
    'facsimileTelephoneNumber': company.get('fax'),
    'telephoneNumber': company.get('phone'),
    'mobile': company.get('mobile'),
    'abn': company.get('abn')
  })

def type_of_entry(ldap_entry):
  if ldap_entry.get('uniqueIdentifier') == None:
    if ldap_entry.get('uidNumber') != None:
      return 'Person'
    else:
      return None
  else:
    return 'Company'

def get_id(ldap_entry):
  entry_type = type_of_entry(ldap_entry)
  if type_of_entry(ldap_entry) == 'Person':
    return ldap_entry['uidNumber'][0]
  elif entry_type == 'Company':
    return ldap_entry['uniqueIdentifier'][0]
  else:
    return None

def to_search_entry(ldap_entry):
  return {
    'id': get_id(ldap_entry),
    'name': ldap_entry.get('cn', [None])[0]
  }


def ldap_page_ctrl():
  return SimplePagedResultsControl(True, size=SIZELIMIT, cookie='')

def search_in_ldap(ldap_client, base, cn):
  ldap_filter = '(cn=*%s*)' % cn

  ldap_response = ldap_client.search_ext_s('%sdc=ish,dc=com,dc=au' % base, ldap.SCOPE_SUBTREE, ldap_filter, serverctrls=[ldap_page_ctrl()])

  if ldap_response == None:
    return []
  else:
    return map(lambda x: to_search_entry(x[1]), ldap_response)

def get_company(ldap_client, id):
  response = ldap_client.search_s('ou=Companies,dc=ish,dc=com,dc=au', ldap.SCOPE_SUBTREE, '(uniqueIdentifier=%d)' % id)
  if response != None and len(response) > 0:
    return response[0]
  else:
    return None

def get_company_people_from_ldap(ldap_client, id):
  company = get_company(ldap_client, id)
  if company == None:
    return None

  company_name = company[1].get('cn')[0]
  ldap_filter = '(o=%s)' % company_name

  ldap_response = ldap_client.search_ext_s('ou=Customers,ou=People,dc=ish,dc=com,dc=au', ldap.SCOPE_SUBTREE, ldap_filter)

  if ldap_response == None:
    return []
  else:
    return map(lambda x: to_search_entry(x[1]), ldap_response)

def get_person(ldap_client, id):
  response = ldap_client.search_s('ou=Customers,ou=People,dc=ish,dc=com,dc=au',ldap.SCOPE_SUBTREE,'(uidNumber=%d)' % id)
  if response != None and len(response) > 0:
    return response[0]
  else:
    return None

def get_person_from_ldap(ldap_client, id):
  return transform_person(get_person(ldap_client, id)[1])

def get_company_from_ldap(ldap_client, id):
  return transform_company(get_company(ldap_client, id)[1])

def modify_person(ldap_client, id, attributes):
  person = get_person(ldap_client, id)
  if person == None:
    return None
  dn = person[0]
  print make_modify_list(person_to_ldap_attrs(attributes))
  ldap_client.modify_s(dn, make_modify_list(person_to_ldap_attrs(attributes)))
  return get_person_from_ldap(ldap_client, id)

def modify_company(ldap_client, id, attributes):
  company = get_company(ldap_client, id)
  if company == None:
    return None
  dn = company[0]
  print make_modify_list(company_to_ldap_attrs(attributes))
  ldap_client.modify_s(dn, make_modify_list(company_to_ldap_attrs(attributes)))
  return get_company_from_ldap(ldap_client, id)

def make_operation(attribute):
  key = clear_param(attribute[0])
  value = clear_param(attribute[1])

  if type(value) is list and len(value) == 0:
    return (ldap.MOD_DELETE, key, None)
  else:
    return (ldap.MOD_REPLACE, key, value)

def make_modify_list(attributes):
  return map(make_operation, attributes.items())

def clear_param(param, first_level=True):
  if not first_level:
    return None
  if type(param) is list:
    return map(lambda x: clear_param(x), param)
  elif type(param) is unicode:
    return param.encode('ascii','ignore')
  elif type(param) is str:
    return param
  else:
    return None
