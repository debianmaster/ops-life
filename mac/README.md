> Add cert to system trust on mac
```sh
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain cert.crt
```
