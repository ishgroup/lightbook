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
    """
    Authenticate as this employee and set the ldap connection to a flask global
    :param username:
    :param password:
    :return: true if the login succeeded, false if not
    """
    try:
        # First use an anonymous connection to get the user's dn
        unauthenticated_conn = LdapApi(config.get_ldap_url())
        dn = unauthenticated_conn.get_employee_dn_by_uid(username)

        # Now create the real LDAP connection bound as the user
        auth_conn = LdapApi(config.get_ldap_url(), dn, password)
        if auth_conn:
            g._ldap_api = auth_conn
            return True

        return False
    except ldap.LDAPError:
        return False

def need_auth_response():
    return Response(
    'Could not verify your access level for that URL.\n'
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'})
