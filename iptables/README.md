## nat internal ip to external public up
```
iptables -t nat -A OUTPUT -p tcp -d <INTERNAL_IP> --dport 6443 -j DNAT --to-destination <PUBLIC_IP>:6443
```

## k3s over internet
```
sudo iptables -t nat -A OUTPUT -p tcp -d <INTERNAL_IP> --dport 6443 -j DNAT --to-destination <PUBLIC_IP>:6443

sudo iptables -t nat -A OUTPUT -p udp -d <INTERNAL_IP> --dport 8472 -j DNAT --to-destination <PUBLIC_IP>:8472

sudo iptables -t nat -A OUTPUT -p tcp -d <INTERNAL_IP> --dport 10250 -j DNAT --to-destination <PUBLIC_IP>:10250
```


