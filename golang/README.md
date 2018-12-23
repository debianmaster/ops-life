```sh
curl -O https://dl.google.com/go/go1.11.4.linux-amd64.tar.gz
tar -C /usr/local -xvzf  go1.11.4.linux-amd64.tar.gz
mkdir -p ~/go/bin

export GOPATH=$HOME/go
export GOBIN=$GOPATH/bin
export PATH=$PATH:/usr/local/go/bin:$GOBIN
```
