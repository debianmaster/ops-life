## Generate self-signed certs
```sh
openssl req \
       -newkey rsa:2048 -nodes -keyout domain.key \
       -x509 -days 365 -out domain.crt
```


```
nmap -p 443 --script ssl-cert gnupg.org
```
