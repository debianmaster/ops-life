```sh

    8  yum install docker -y
    9  systemctl start docker
   12  curl -L https://raw.githubusercontent.com/hasura/graphql-engine/master/install-manifests/docker-compose/docker-compose.yaml > docker-compose.yaml
   14  yum install docker-compose -y
   15  docker-compose up -d
   ```
