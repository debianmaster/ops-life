```sh
echo "cgroup /sys/fs/cgroup cgroup defaults 0 0" >> /etc/fstab
mount /sys/fs/cgroup/
apk update
apk add docker
service docker start
```


```sh
pip install docker-compose
```
