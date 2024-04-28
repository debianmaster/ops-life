> Simple self signed cert generation
```
openssl genrsa -out httpbin.org.key 2048
openssl req -new -x509 -key httpbin.org.key -out httpbin.org.crt -days 365 -subj "/C=US/ST=California/L=San Francisco/O=Your Organization/OU=Your Department/CN=httpbin.org"
```
> Inspect cert
```
openssl x509 -in /config/keys/cert.crt -noout -text
```

```
echo | openssl s_client -showcerts -servername 192.168.65.2.nip.io -connect 192.168.65.2.nip.io:443 2>/dev/null | openssl x509 -inform pem -noout -text
````


# to check of req,cert and private key matching

```
openssl req -noout -modulus -in  server.csr | openssl md5
(stdin)= 395cb6f3a0def959d81f8f6a26d12749

openssl rsa -noout -modulus -in myserver.key | openssl md5
(stdin)= 395cb6f3a0def959d81f8f6a26d12749

openssl x509 -noout -modulus -in ssl-bundle.crt | openssl md5
(stdin)= 395cb6f3a0def959d81f8f6a26d12749

```

# add a cert to pki
```
openssl s_client -connect devops.xyz.cloud:443 -showcerts </dev/null 2> /dev/null | sed -e '/-----BEGIN/,/-----END/!d' | tee "/usr/local/share/ca-certificates/ca.crt" >/dev/null && update-ca-certificates
```
