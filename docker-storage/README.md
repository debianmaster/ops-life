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


##  If following error

```
[root@scw-09bef9 ~]# docker-storage-setup
INFO: Volume group backing root filesystem could not be determined
ERROR: Partition specification unsupported at this time.
````


```sh
wipefs -f /dev/sda1
vgcreate docker-vg /dev/sda1
```
```
[root@scw-09bef9 ~]# cat /etc/sysconfig/docker-storage-setup
#STORAGE_DRIVER=overlay2
#DEVS=/dev/sda
VG=docker-vg
```

```sh
docker-storage-setup
```
```sh



