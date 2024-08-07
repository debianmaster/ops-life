## custom metrics count by hour

```
customMetrics
| where timestamp >= datetime(2024-08-01) and timestamp < datetime(2024-08-08) and name has "envoy_"
| summarize count() by bin(timestamp, 1h)
| order by timestamp desc

```

## List all unique metrics by count

```
customMetrics
| summarize count() by name
| order by count_ desc
```
