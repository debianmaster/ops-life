nmap -sS -O <ip address>

netstat -rn

```
sysctl -w net.ipv4.ip_forward=1
or 
/etc/sysctl.d/net.conf 
```


show connection
```
nmcli conn show
```
