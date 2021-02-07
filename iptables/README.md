## nat internal ip to external public up
```
iptables -t nat -A OUTPUT -p tcp -d <INTERNAL_IP> --dport 6443 -j DNAT --to-destination <PUBLIC_IP>:6443
```
