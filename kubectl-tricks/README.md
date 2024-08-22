```sh
k get deploy hm  -o jsonpath="{.metadata.labels.v}"

```

## find number of cpus on nodes
```
kubectl get nodes -o=jsonpath="{range .items[*]}{.metadata.name}{\"\t\"} {.status.capacity.cpu}{\"\n\"}{end}"
```
