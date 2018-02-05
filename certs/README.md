## Generate self signed certs
```sh
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /d/tmp/nginx.key -out /d/tmp/nginx.crt -subj "/CN=nginxsvc/O=nginxsvc"
```
## Verify certs
```
certutil -v
```
