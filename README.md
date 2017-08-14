## Mongodb

#### Login as Admin
```sh
mongo --host 127.0.0.1
use admin
db.auth('admin','adminpass')
```
#### Restore a database
```
mongorestore --host mongodb1.example.net --port 37017 --username user --password "pass" --db "database" /opt/backup/mongodump-2011-10-24
```


## Networking (oh-my...)
#### Add additional DNS servers to host
```
/etc/sysconfig/network-scripts/ifcfg-eth0
DNS1=dns1.server.com
DNS2=dns1.server.com
```


#### Openshift upstream dns
```
cat /etc/dnsmasq.d/origin-upstream-dns.conf
```

```
dig  @localhost -x 172.30.197.228 +short
```
