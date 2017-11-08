##  Import certs to rootca
```sh
openssl verify bundle.crt
update-ca-trust enable
cp bundle.crt /etc/pki/ca-trust/source/anchors/bundle.crt
update-ca-trust extract
openssl verify bundle.crt
```

