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

def transform_company(ldap_company):
  return {
    'id': ldap_company['uniqueIdentifier'][0],
    'name': ldap_company['cn'][0],
    'notes': ldap_company.get('description', [None])[0],
    'fax': ldap_company.get('facsimileTelephoneNumber'),
    'phone': ldap_company.get('telephoneNumber'),
    'mobile': ldap_company.get('mobile'),
    'abn': ldap_company.get('abn', [None])[0],
  }

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
    return response[0][1]
  else:
    return None

def get_company_people_from_ldap(ldap_client, id):
  company = get_company(ldap_client, id)
  if company == None:
    return None

  company_name = company.get('cn')[0]
  ldap_filter = '(o=%s)' % company_name

  ldap_response = ldap_client.search_ext_s('ou=Customers,ou=People,dc=ish,dc=com,dc=au', ldap.SCOPE_SUBTREE, ldap_filter)

  if ldap_response == None:
    return []
  else:
    return map(lambda x: to_search_entry(x[1]), ldap_response)

def get_person(ldap_client, id):
  response = ldap_client.search_s('ou=Customers,ou=People,dc=ish,dc=com,dc=au',ldap.SCOPE_SUBTREE,'(uidNumber=%d)' % id)
  if response != None and len(response) > 0:
    return response[0][1]
  else:
    return None

def get_person_from_ldap(ldap_client, id):
  return transform_person(get_person(ldap_client, id))

def get_company_from_ldap(ldap_client, id):
  return transform_company(get_company(ldap_client, id))
