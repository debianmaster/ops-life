```sh
jq -Rsn '
  {"Stops":
    [inputs
     | . / "\n"
     | (.[] | select(length > 0) | . / ",") as $input
     | {"position": [$input[2], $input[3]], "StopID":$input[0],"StopName":$input[1]}]}
' < stops_id2.csv
```
