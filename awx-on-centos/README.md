```sh

yum update -y
yum install git ansible docker -y
sytemctl restart docker
easy_install pip
pip install docker-py


mkdir -p /apps
git clone https://github.com/ansible/awx /apps/awx
cd /apps/awx
ansible localhost -m lineinfile -a "line='use_docker_compose=false'  path='installer/inventory' "
ansible localhost -m lineinfile -a "line='host_port=8001'  path='installer/inventory' regexp='^host_port' "
ansible-playbook installer/install.yml -i installer/inventory


```
