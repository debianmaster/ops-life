releasever="$(rpm -q --qf '%{VERSION}' "$(rpm -q --whatprovides centos-release)")" \
 && releasever="$(printf "%s" "$releasever" | sed -e 's/\..*$//g')" \
 && basearch="$(uname -m)" \
 && reposurl=$(printf "%s" "http://mirror.centos.org/centos/$releasever/os/$basearch/Packages/") \
 && releaserpm=$(curl --silent "$reposurl" | grep -oP '(?<=")centos-release.*.rpm(?=")') \
 && releaseuri=$(printf "%s%s" "$reposurl" "$releaserpm") \
 && rpm -Uvh --force "$releaseuri"
