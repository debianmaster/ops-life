```sh
lvdisplay
> get the lv name
lvextend -l +100000  /dev/rhelah_site/root

resize2fs /dev/rhelah_site/root
or 
xfs_growfs /dev/rhelah_site/root
```
