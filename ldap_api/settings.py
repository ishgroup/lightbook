#!/usr/bin/env python2

import json
import os


class SiteSettings:
    def __init__(self):
        config_file = '%s/../ldap.json' % os.path.dirname(os.path.realpath(__file__))

        with open(config_file) as data_file:
            self.config = json.load(data_file)

    def get_ldap_url(self):
        return self.config['ldap_url']

    def get_bind_ip(self):
        return self.config['bind_ip'] if self.config['bind_ip'] else "localhost"

    def get_bind_port(self):
        return self.config['bind_port'] if self.config['bind_port'] else 5050
