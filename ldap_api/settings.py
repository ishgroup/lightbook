import json
import os


class SiteSettings:
    def __init__(self):
        config_file = '%s/../ldap.json' % os.path.dirname(os.path.realpath(__file__))

        with open(config_file) as data_file:
            self.config = json.load(data_file)

    def get_ldap_url(self):
        return self.config.get('ldap_url')

    def get_ldap_base(self):
        return self.config.get('ldap_base')

    def get_bind_ip(self):
        return self.config.get('bind_ip', 'localhost')

    def get_bind_port(self):
        return self.config.get('bind_port', 5050)
