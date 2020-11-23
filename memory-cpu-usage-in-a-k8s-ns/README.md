```
kubectl top po | awk '{print $3}' | sed 's/Mi//g' | awk 'NR > 1' | awk '{s+=$1} END {print s}'
```
