```sh
echo "cgroup /sys/fs/cgroup cgroup defaults 0 0" >> /etc/fstab
mount /sys/fs/cgroup/
apk update
apk add docker
service docker start
```


```sh
RUN COMPOSE_VERSION="1.23.2" \
&& apk add --no-cache \
  py-pip \
&& pip install --no-cache-dir \
  docker-compose==${COMPOSE_VERSION}
```
