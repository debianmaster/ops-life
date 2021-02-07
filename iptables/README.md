## nat internal ip to external public up
```
iptables -t nat -A OUTPUT -p tcp -d <INTERNAL_IP> --dport 6443 -j DNAT --to-destination <PUBLIC_IP>:6443
```

## flush nat
```
sudo iptables -t nat -F
```


## k3s over internet
```
https://github.com/k3s-io/k3s/pull/881#issuecomment-611193981
```


