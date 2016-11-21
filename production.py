from gevent import monkey
from gevent import wsgi
import app

monkey.patch_all()
app = Flask(__name__)

server = wsgi.WSGIServer(('203.29.62.211', 5050), app)
server.serve_forever()