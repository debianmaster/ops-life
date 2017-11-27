## Convert XX.md file to XX.html
```sh
jq --slurp --raw-input '{"text": "\(.)", "mode": "markdown"}' \
< 01_Deploying_microservices.md | curl --data @- https://api.github.com/markdown > b.html
```
