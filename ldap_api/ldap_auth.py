from flask import request, g, Response
from functools import wraps
from .settings import SiteSettings
import ldap
import ldap.filter
from .ldap_service import LdapService

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
    if g.get('ldap_service', None):
        return True

    url = config.get_ldap_url()

    try:
        # first let's create an anonymous LDAP connection
        unauthenticated_conn = ldap.initialize(url)
        unauthenticated_conn.simple_bind_s()

        # now find the employee
        ldap_filter = ldap.filter.filter_format('(uid=%s)', [username])
        ldap_response = unauthenticated_conn.search_ext_s(config.get_ldap_base(), ldap.SCOPE_SUBTREE, ldap_filter)
        if not ldap_response:
            raise OSError("Your login was not correct.")

        # now let's bind with this employee
        dn = ldap_response[0][0]
        auth_conn = ldap.initialize(url)
        auth_conn.simple_bind_s(dn, password)
        if not auth_conn:
            raise OSError("Your login was not correct.")

        g.ldap_service = LdapService(auth_conn)
        return True

    except (ldap.LDAPError, OSError):
        return False


def need_auth_response():
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})
