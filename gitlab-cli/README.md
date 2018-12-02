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
gitlab project-variable create --key=CI_ASS --value=test --project-id=9721986   #set ci variable
```

https://python-gitlab.readthedocs.io/en/stable/cli.html
