> One line command
```sh
python -m SimpleHTTPServer 8001
```



> http.py
```python
import SimpleHTTPServer
import SocketServer

PORT = 80

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
```
```command
sudo python http.py
```



> https.py
```command
$ openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
```
```python
import BaseHTTPServer, SimpleHTTPServer
import ssl

httpd = BaseHTTPServer.HTTPServer(('0.0.0.0', 443), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./server.pem', server_side=True)
httpd.serve_forever()
```
```command
sudo python https.py
```
Note:- 
> This will expose current folder on web



# key/pair
```python
from http.server import HTTPServer, BaseHTTPRequestHandler
import ssl


httpd = HTTPServer(('localhost', 4443), BaseHTTPRequestHandler)

httpd.socket = ssl.wrap_socket (httpd.socket, 
        keyfile="path/to/key.pem", 
        certfile='path/to/cert.pem', server_side=True)

httpd.serve_forever()
```
