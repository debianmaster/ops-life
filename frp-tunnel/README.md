## on server [manage.example.io]
> frps.ini

```sh
[common]
bind_port = 6443
vhost_http_port =  9043
vhost_https_port = 9433
```

```sh
nohup frps -c ./frps.ini &
```



## on client
> frpc.ini
```sh
[common]
server_addr = manage.example.io
server_port = 6443

[web]
type = https
local_port = 6443
custom_domains = manage.example.io
```

```sh
sudo frpc -c ./frpc.ini
```
