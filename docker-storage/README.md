```
docker-storage-setup --reset
rm -rf /var/lib/docker
```

if this fails complaining 2 docker-vg volume
use  vgremove --selector uuid='asfasdfasdfasdfsf'


> how confirm what device docker-vg is mappe to
`lsblk`


>  list volumes
`lvs`
`lvdisplay`

