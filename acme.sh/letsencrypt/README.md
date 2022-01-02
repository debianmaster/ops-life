```
curl https://get.acme.sh | sh
acme.sh  --issue -d keycloak.app --standalone --register-account=9chakri@gmail.com
acme.sh  --issue -d keycloak.app --standalone
docker run --name keycloak   -e KEYCLOAK_USER=myadmin   -e KEYCLOAK_PASSWORD=pass   -p 8443:8443   -v /root/.acme.sh/keycloak.app/fullchain.cer:/etc/x509/https/tls.crt   -v /root/.acme.sh/keycloak.app/keycloak.app.key:/etc/x509/https/tls.key -d  jboss/keycloak
```

```sh

apt upgrade -y
apt install wget -y
wget -O -  https://get.acme.sh | sh

/root/.acme.sh/acme.sh --issue -d k8s.test.dev --dns \
 --yes-I-know-dns-manual-mode-enough-go-ahead-please


/root/.acme.sh/acme.sh --renew -d k8s.test.dev \
  --yes-I-know-dns-manual-mode-enough-go-ahead-please 



/root/.acme.sh/acme.sh --issue -d *.apps.test.dev --dns \
 --yes-I-know-dns-manual-mode-enough-go-ahead-please

/root/.acme.sh/acme.sh --renew -d *.apps.test.dev \
  --yes-I-know-dns-manual-mode-enough-go-ahead-please   

```
