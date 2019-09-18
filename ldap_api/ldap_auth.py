from functools import wraps

import ldap
import ldap3
import ldap.filter
from flask import request, g, Response

from .ldap_service import LdapService
from .settings import SiteSettings
from urllib.parse import urlparse

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
        server = urlparse(url).hostname
        s = ldap3.Server(server, get_info=ldap3.ALL)
        unauthenticated_conn = ldap3.Connection(s)
        if not unauthenticated_conn.bind():
            raise OSError('Connection error.')
        # now find the employee
        unauthenticated_conn.search(
            search_base=config.get_ldap_base(),
            search_scope=ldap3.SUBTREE,
            search_filter=f'(uid={username})',
            attributes=ldap3.ALL_ATTRIBUTES
        )
        dn = unauthenticated_conn.response[0]['dn']

        # now let's bind with this employee
        auth_conn = ldap3.Connection(s, user=dn, password=password)
        if not auth_conn.bind():
            raise OSError('No such user')
        g.ldap_service = LdapService(auth_conn)

        return True

    except Exception as e:
        return False


def need_auth_response():
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})
