> Inspect cert
```
openssl x509 -in /config/keys/cert.crt -noout -text
```

```
echo | openssl s_client -showcerts -servername 192.168.65.2.nip.io -connect 192.168.65.2.nip.io:443 2>/dev/null | openssl x509 -inform pem -noout -text
````




```
openssl x509 -noout -modulus -in cert.crt | openssl md5
openssl rsa -noout -modulus -in privkey.txt | openssl md5
```
