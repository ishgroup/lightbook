#!/usr/bin/env /usr/local/bin/python2

from gevent import monkey
from gevent import wsgi
from app import app

monkey.patch_all()

server = wsgi.WSGIServer(('203.29.62.211', 5050), app)
server.serve_forever()
