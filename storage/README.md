volume to device link
```
lvs -o +devices /dev/mapper/exportvg-exportlv
```


> Good video on lv,pv,etc

https://www.youtube.com/watch?v=fadQX2e_PGk



>
```lvextend -L75000 /dev/vg00/var```
```resize2fs /dev/vg00/var```
