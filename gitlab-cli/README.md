```
sudo pip install python-gitlab

vi ~/.python-gitlab.cfg
[global]
default = somewhere
ssl_verify = true
timeout = 5

[somewhere]
url = https://gitlab.com/
private_token = dummydummy
api_version = 4
```

```sh
gitlab project create --name test11223
```

https://python-gitlab.readthedocs.io/en/stable/cli.html
