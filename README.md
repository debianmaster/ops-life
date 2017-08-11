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
