```sh
for host in google.com bing.com cloudflare.com patriots.com; do echo -en "$host\t" && openssl s_client -connect www.$host:443 -servername www.$host 2>/dev/null </dev/null | grep "has read"; done
```
