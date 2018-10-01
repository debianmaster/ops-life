```sh
mkdir data
docker run -d -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo -v $(pwd)/data:/var/lib/postgresql/data --name db postgres:9.4
docker run -p 8069:8069 -e DB_PORT_5432_TCP_PORT=26257 -d --link db:db --name=odoo  odoo:11.0
```
