```
docker-storage-setup --reset
rm -rf /var/lib/docker
```

if this fails complaining 2 docker-vg volume
use  vgremove --selector uuid='asfasdfasdfasdfsf'


> 
```
# systemctl stop docker
# umount /var/lib/docker/volumes
# rm -rf /var/lib/docker
# docker-storage-setup --reset
# docker-storage-setup
# systemctl start docker
# systemctl status docker
```

> how confirm what device docker-vg is mappe to
`lsblk`


>  list volumes
`lvs`
`lvdisplay`

