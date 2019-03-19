> centos
```sh
firewall-cmd --add-port=51820/udp --permanent
firewall-cmd --reload
cp /usr/lib/firewalld/services/smtp-submission.xml /etc/firewalld/services/submission.xml
```
