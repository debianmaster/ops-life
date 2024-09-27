```sh
for i in $(ls /docker/devicemapper/mnt/); do umount /docker/devicemapper/mnt/$i; done
for i in $(ls /docker/containers/); do umount /docker/containers/$i/shm; done
umount /docker/containers/
umount /docker/devicemapper
rm -rf /docker/
```
