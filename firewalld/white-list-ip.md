```
sudo apt update
sudo apt install firewalld

sudo systemctl start firewalld
sudo systemctl enable firewalld

sudo firewall-cmd --permanent --new-zone=trusted_ips

sudo firewall-cmd --permanent --zone=trusted_ips --add-source=65.27.169.245
sudo firewall-cmd --permanent --zone=trusted_ips --add-source=60.27.169.245
sudo firewall-cmd --permanent --zone=trusted_ips --add-service=ssh
sudo firewall-cmd --permanent --zone=trusted_ips --add-service=http
sudo firewall-cmd --permanent --zone=trusted_ips --add-service=https

sudo firewall-cmd --set-default-zone=drop
sudo firewall-cmd --reload

sudo firewall-cmd --get-default-zone
sudo firewall-cmd --zone=trusted_ips --list-all

```
