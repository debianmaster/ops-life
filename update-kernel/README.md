```sh

  554  rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
  555  yum install https://www.elrepo.org/elrepo-release-7.0-3.el7.elrepo.noarch.rpm
  556  yum list available --disablerepo='*' --enablerepo=elrepo-kernel
  557  yum --disablerepo='*' --enablerepo=elrepo-kernel install kernel-lt
  558  yum --disablerepo='*' --enablerepo=elrepo-kernel install kernel-ml
  ```
