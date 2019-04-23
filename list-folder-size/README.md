```sh
du -s * | sort -n | cut -f2 | tr '\n' '\0' | xargs -0 -I {} du -sh "{}"
```
