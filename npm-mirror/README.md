
## configure verdaccio to use s3 storage

```
npm install -g verdaccio
npm install verdaccio-s3-storage -g
verdaccio
ctrl+c
```

> append this to ~/.config/verdaccio/config.yaml

```yaml
store:
  s3-storage:
    bucket: npm
    region: minio # optional, will use aws s3's default behavior if not specified
    endpoint: http://s3.example.com # optional, will use aws s3's default behavior if not specified
    s3ForcePathStyle: true # optional, will use path style URLs for S3 objects
    accessKeyId: myaccesskey # optional, aws accessKeyId for private S3 bucket
    secretAccessKey: mysecretkey # optional, aws secretAccessKey for private S3 bucket
```    
```
verdaccio
```
