```sh
dd if=/dev/zero of=./largefile bs=1M count=1024 oflag=direct
1024+0 records in
1024+0 records out
1073741824 bytes (1.1 GB) copied, 4.82364 s, 223 MB/s
```

```sh
https://www.unixmen.com/how-to-measure-disk-performance-with-fio-and-ioping/
```
