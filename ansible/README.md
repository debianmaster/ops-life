```sh
ansible all -m copy  -a 'src=multipath.conf dest=/etc/multipath.conf' -i openshift_inventory.cfg
``


```sh
# Display facts from all hosts and store them indexed by I(hostname) at C(/tmp/facts).
# ansible all -m setup --tree /tmp/facts

# Display only facts regarding memory found by ansible on all hosts and output them.
# ansible all -m setup -a 'filter=ansible_*_mb'

# Display only facts returned by facter.
# ansible all -m setup -a 'filter=facter_*'

# Collect only facts returned by facter.
# ansible all -m setup -a 'gather_subset=!all,!any,facter'
```
