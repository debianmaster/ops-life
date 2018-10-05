```sh
mkdir data
docker run -d -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo -v $(pwd)/data:/var/lib/postgresql/data --name db postgres:9.4
docker run -p 8069:8069 -d --link db:db --name=odoo  odoo:12.0
```
