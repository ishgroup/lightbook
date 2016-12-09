from flask import request, g, Response
from functools import wraps
from settings import SiteSettings
from ldap_api import LdapApi
import ldap

config = SiteSettings()

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not authenticate(auth.username, auth.password):
            return need_auth_response()
        return f(*args, **kwargs)
    return decorated


def authenticate(username, password):
    try:
        common_api = LdapApi(config.get_ldap_url())
        dn = common_api.get_employee_dn_by_uid(username)
        g._ldap_api = LdapApi(config.get_ldap_url(), dn, password)
        return True
    except ldap.LDAPError:
        return False

def need_auth_response():
    return Response(
    'Could not verify your access level for that URL.\n'
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'})
