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



> Given actual upstream service is running on   https://localhost:6443

## client with ssh
```sh
[common]
server_addr = manage.run9.io
server_port = 6443

[web]
type = https
local_port = 6443
custom_domains = manage.run9.io
#vhost_https_port = 9433
#proxy_protocol_version = v2

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 11009
```
