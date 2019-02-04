```sh
yum install libvirt-devel gcc-c++ -y 
curl -O https://dl.google.com/go/go1.11.4.linux-amd64.tar.gz
tar -C /usr/local -xvzf  go1.11.4.linux-amd64.tar.gz
mkdir -p ~/go/bin

export GOPATH=$HOME/go
export GOBIN=$GOPATH/bin
export PATH=$PATH:/usr/local/go/bin:$GOBIN
```



```sh
curl https://raw.githubusercontent.com/golang/dep/master/install.sh | sh
```

```sh
mkdir -p $HOME/go/src/github.com/openshift
cd $HOME/go/src/github.com/openshift
git clone https://github.com/openshift/installer
cd installer
TAGS=libvirt hack/build.sh
ln  ./bin/openshift-install /usr/local/bin/oi
```
