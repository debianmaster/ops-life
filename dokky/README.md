## on server
### set application
```
wget -NP . https://dokku.com/install/v0.35.12/bootstrap.sh
sudo DOKKU_TAG=v0.35.12 bash bootstrap.sh
cat ~/.ssh/authorized_keys | sudo dokku ssh-keys:add admin
dokku domains:set-global yourdomain.com
dokku apps:create ruby-getting-started
```

## on local machine
```
cat ~/.ssh/id_rsa.pub
> Copy the public key to dokku server /home/dokku/.ssh/authorized_keys
git clone https://github.com/heroku/ruby-getting-started
cd ruby-getting-started
git remote add dokku dokku@yourdomain.com:ruby-getting-started
git push dokku main

```

## Accessing the application
```bash
access your application at http://ruby-getting-started.yourdomain.com
```


## Bonus
## set custom rate limits
https://www.joseferben.com/posts/rate-limiting-with-dokku
```bash
sudo vim /var/lib/dokku/plugins/available/nginx-vhosts/templates/nginx.conf.sigil
Copy the default nginx.conf template and create a new file nginx.conf.sigil in the app root. Dokku will use this template to create the nginx.conf for this app.

Add the limit_req_zone directive, make sure it's outside the range loop:

limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

{{ range $port_map := .PROXY_PORT_MAP | split " " }}
{{ $port_map_list := $port_map | split ":" }}
{{ $scheme := index $port_map_list 0 }}
{{ $listen_port := index $port_map_list 1 }}
{{ $upstream_port := index $port_map_list 2 }}

# ...
Add the limit_req directives to the paths that you want to rate limit. In my case, there were 2 root paths.

location    / {
    limit_req zone=one burst=20;

# ...
```

### restart 
```
dokku ps:restart --all
```
