## Mongodb

#### Login as Admin
```sh
mongo --host 127.0.0.1
use admin
db.auth('admin','adminpass')
```

#### Take db backup
```
mongodump --host mongodb.example.net --port 27017 --username user --password "pass" --db "database" --authenticationDatabase="targetdb" --out /data/backup/
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
```sh
cat /etc/dnsmasq.d/origin-upstream-dns.conf
server=192.168.119.10
server=192.168.119.11
```
```sh
cat /etc/resolv.conf | grep nameserver | sed 's/nameserver /server=/g' >> /etc/dnsmasq.d/origin-upstream-dns.conf
```

#### Openshift upstream dns
```
cat /etc/dnsmasq.d/origin-upstream-dns.conf
```

```
dig  @localhost -x 172.30.197.228 +short
```

### Openshift Debugging tools
```
oc run rhel-toolbox --image=registry.access.redhat.com/rhel7/rhel-tools --restart=Never --attach -i --tty
```
### Openshift Debugging steps
#### Network 
https://access.redhat.com/solutions/2529411
```sh
dig  @localhost -x 172.30.128.67 +short
host docker-registry-default.svc.local
```


### check proxy config at following locations
/etc/rhsm/rhsm.conf   
/etc/yum.conf   
/etc/sysconfig/docker  
/etc/environment  
/etc/ansible/hosts  



## Azure (Oh-My..)
#### IF you want to attach storage to a Blob based root disks
> If error = Addition of a managed disk to a VM with blob based disks is not supported   
```sh
az vm unmanaged-disk  attach -g ocp-rg --vm-name ocp-node-1  --size-gb 50   --new
```

### Reset Docker storage
```sh
systemctl stop docker
rm -rf /var/lib/docker
docker-storage-setup --reset
```
### Get rid of satellite repos. 
```sh
asible all -m file -a 'dest= status=absent' #wip
```
### NO_PROXY for openshift
```sh
172.17.0.0/16,.domain.nodes.com,172.30.0.0/16
```

### Replace in all files
```sh
find . -type f | xargs -n1 sed -i '' 's/old_string/new_string/g'
```
