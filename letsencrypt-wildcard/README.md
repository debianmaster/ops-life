
```
export  AWS_ACCESS_KEY_ID=mykey
export  AWS_SECRET_ACCESS_KEY=mykey
curl https://get.acme.sh | sh
.acme.sh/acme.sh --issue --dns dns_aws -d dev.mydomain.sh -d '*.dev.mydomain.sh'
```    
