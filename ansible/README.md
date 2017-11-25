```sh
ansible all -m copy  -a 'src=multipath.conf dest=/etc/multipath.conf' -i openshift_inventory.cfg
``
