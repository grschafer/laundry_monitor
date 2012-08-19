from flask import Flask, g, request, render_template, jsonify
import pymongo
import logging
import time

# configuration
SERVER = {'host':'0.0.0.0', 'port':5000}
DATABASE = {'host':'localhost', 'port':27017}
USE_DB = 'laundrymon'
DEBUG = True
# used for crypto functions
SECRET_KEY = "h\xb9\n\xa1\xcd`-\x89\x17\x8c\x87K\x08\x0c\x15\x14\xc2U\xf18\xa0\xf3\xab\xe0"

app = Flask(__name__)
# configure app using this module's global config values
# (see above configuration section)
app.config.from_object(__name__)

# configure file logger
file_handler = logging.FileHandler('server.log')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter(
    '[%(asctime)s] %(levelname)s in %(module)s (%(pathname)s:%(lineno)d): %(message)s'
))
app.logger.addHandler(file_handler)

# ensure timestamp index
db = pymongo.Connection(**app.config['DATABASE'])
db[USE_DB].states.ensure_index('timestamp', pymongo.DESCENDING)
db.disconnect()

# ============================================================================ #
# Data Functions #
# ============================================================================ #
    
def get_machine_states(db, n):
    states = db.states.find({}, {'_id':0}) \
                      .sort('timestamp', pymongo.DESCENDING)[0:n]
    states = list(states)
    print 'states:',states
    return states[::-1]

# ============================================================================ #
# View Functions #
# ============================================================================ #

@app.route('/')
def frontpage():
    return render_template('frontpage.html')
    
@app.route('/get_state')
def get_state():
    return jsonify(states=get_machine_states(g.db, 1))
    
@app.route('/get_state_history/<int:n>')
def get_state_history(n):
    return jsonify(states=get_machine_states(g.db, n))

# ============================================================================ #
# Connection and Logging Functions #
# ============================================================================ #

def connect_db():
    db = pymongo.Connection(**app.config['DATABASE'])
    return db[USE_DB]

@app.before_request
def before_request():
    g.db = connect_db()

    # log request
    app.logger.info('|'.join(map(lambda x: str(x), [
            request.headers.get('X-Google-Account'),
            request.remote_addr,
            request.method,
            request.path,
            request.headers.get('User-Agent'),
        ])))

@app.after_request
def after_request(resp):
    return resp

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.connection.disconnect()


if __name__ == '__main__':
    app.run(**app.config['SERVER'])
