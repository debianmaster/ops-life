## Generate self signed certs
```sh
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /d/tmp/nginx.key -out /d/tmp/nginx.crt -subj "/CN=nginxsvc/O=nginxsvc"

openssl req -new -x509 -days 365 -nodes -out saml.crt -keyout saml.key

```
## Verify certs
```
certutil -v
```


```sh
openssl req -x509 -newkey rsa:4096 -keyout domain.key -out domain.crt -days 365
```
