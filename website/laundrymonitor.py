# based largely on the werkzeug tutorial
#   http://werkzeug.pocoo.org/docs/tutorial/

import sqlite3
import time
from werkzeug.wrappers import Request, Response
from werkzeug.routing import Map, Rule
from werkzeug.exceptions import HTTPException, NotFound

class LaundryMonitor(object):
    def __init__(self):
    # init routing rules
        self.url_map = Map([
            Rule('/', endpoint='new_url'),
            Rule('/getdata', endpoint='get_data'),
            Rule('/postdata', endpoint='post_data')
        ])

        self.machines = ('w21', 'w22', 'd21', 'd22', 'w31', 'w32', 'd31', 'd32')

        # init database connection
        conn = sqlite3.connect('/var/www/laundrymonitor/laundrydata')
        conn.execute('''create table if not exists machine_usage (date real, w21 integer, w22 integer, d21 integer, d22 integer, w31 integer, w32 integer, d31 integer, d32 integer)''')
        conn.commit()
        conn.close()
         
    
    # read from file, return current status (+ history?) in json
    def on_new_url(self, request):
        return Response('Hello thar!')
    # read from file, return current status (+ history?) in json
    def on_get_data(self, request):
        # init database connection
        conn = sqlite3.connect('/var/www/laundrymonitor/laundrydata')
        c = conn.cursor()
        c.execute('''select * from machine_usage''')

        s = 'Have some data:\n'
        for row in c:
            s += str(row)
        conn.close()
        return Response(s)

    # read from file, return current status (+ history?) in json
    def on_post_data(self, request):
        keepdata = {}
        keepdata['date'] = time.time()
        for k in self.machines:
            keepdata[k] = request.args.get(k, None)
        text = 'you submitted: %s' % str(keepdata)
        if len(keepdata) > 1:
            # init database connection
            conn = sqlite3.connect('/var/www/laundrymonitor/laundrydata')
            c = conn.cursor()
            c.execute('''insert into machine_usage(%s) values(?,?,?,?,?,?,?,?,?)''' % str(keepdata.keys()).strip('[]').replace("'", ""), tuple(keepdata.values()))
            conn.commit()
            conn.close()
        return Response(text)
    
    
    def dispatch_request(self, request):
        adapter = self.url_map.bind_to_environ(request.environ)
        try:
            endpoint, values = adapter.match()
            return getattr(self, 'on_' + endpoint)(request, **values)
        except HTTPException, e:
            return e
    
    def wsgi_app(self, environ, start_response):
        request = Request(environ)
        response = self.dispatch_request(request)
        return response(environ, start_response)
    
    def __call__(self, environ, start_response):
        return self.wsgi_app(environ, start_response)

def create_app():
    app = LaundryMonitor()
    return app

if __name__ == '__main__':
    from werkzeug.serving import run_simple
    app = create_app()
    run_simple('127.0.0.1', 5000, app, use_debugger=True, use_reloader=True)
