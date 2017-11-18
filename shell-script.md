## print tab in awk
```sh
oc get po --show-labels -o wide | awk '{print $1,"\t",$6,"\t",$7,"\t",$8}'
```
