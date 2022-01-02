```
curl https://get.acme.sh | sh
acme.sh  --issue -d keycloak.app --standalone --register-account=9chakri@gmail.com
acme.sh  --issue -d keycloak.app --standalone

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
