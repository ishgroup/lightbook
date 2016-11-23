#!/usr/bin/env /usr/local/bin/python2

from gevent import monkey
from gevent import wsgi
from app import app

monkey.patch_all()

if not app.debug:
  import logging
  file_handler = logging.FileHandler('/var/log/lightbook/lightbook.log')
  file_handler.setLevel(logging.NOTSET)
  app.logger.addHandler(file_handler)

server = wsgi.WSGIServer(('203.29.62.211', 5050), app)
server.serve_forever()
