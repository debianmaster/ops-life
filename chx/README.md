====== Installation ======   

The installation of OpenShift Enterprise (OSE); will be done via scripts. More information can be found using the OpenShift [[https://docs.openshift.com/container-platform/latest/welcome/index.html|documentation site]]. 

More OpenShift examples an be [[https://github.com/christianh814/openshift-toolbox|found here]].
===== Infrastructure =====

For this installation we have the following
  * Wildcard DNS entry - *.cloudapps.example.com 172.16.1.247
  * Master
    * ose3-master.example.com
    * 172.16.1.247
    * Also acting as a node
  * Node1
    * ose3-node1.example.com
    * 172.16.1.246
  * Node2
    * ose3-node2.example.com
    * 172.16.1.245

Servers installed with RHEL 7.1 (Greater than 7.1 is required for openvswitch) at a "minimum" installation.

Forward/Reverse DNS is a MUST for master/nodes

Map of how OSEv3 works:

{{:osev3.jpg?690|}}


===== Host preparation =====

Each host must be registered using RHSM and have an active OSE subscription attached to access the required packages.

On each host, register with RHSM:
<code>
subscription-manager register --username=${user_name} --password=${password}
</code>

List the available subscriptions:
<code>
subscription-manager list --available
</code>

In the output for the previous command, find the pool ID for an OpenShift Enterprise subscription and attach it:

<code>
subscription-manager attach --pool=${pool_id}
</code>

**__NOTE:__** You can have RHSM do this for you in one shot
<code>
subscription-manager register --username=${user_name} --password=${password} --auto-attach
</code>

Disable all repositories and enable only the required ones:

<code>
subscription-manager repos  --disable=*
subscription-manager repos \
    --enable="rhel-7-server-rpms" \
    --enable="rhel-7-server-extras-rpms" \
    --enable="rhel-7-server-ose-3.6-rpms" \
    --enable="rhel-7-fast-datapath-rpms"
</code>

Make sure the pre-req pkgs are installed/removed and make sure the system is updated
<code>
yum -y install wget git net-tools bind-utils iptables-services bridge-utils bash-completion vim kexec sos 
psacct
yum -y update
yum -y install atomic-openshift-utils
# yum -y install atomic-openshift-excluder atomic-openshift-docker-excluder
# atomic-openshift-excluder unexclude
systemctl reboot
</code>

Then install docker when it comes back up. Make sure you're running the version it states in the docs
<code>
yum -y install docker-1.12.6
docker version
</code>

===== Docker Configuration =====

Configure docker by editing the // /etc/sysconfig/docker // file and add // --insecure-registry 0.0.0.0/0 // to the OPTIONS parameter. For example: 

<code>
OPTIONS=--selinux-enabled --insecure-registry 0.0.0.0/0
</code>

You can do this with a sed statement
<code>
root@master# sed -i '/OPTIONS=.*/c\OPTIONS="--selinux-enabled --log-driver=journald --signature-verification=false --insecure-registry 172.30.0.0/16"' /etc/sysconfig/docker
</code>

Next configure docker storage.

Docker’s default loopback storage mechanism is not supported for production use and is only appropriate for proof of concept environments. For production environments, you must create a thin-pool logical volume and re-configure docker to use that volume.

You can use the docker-storage-setup script to create a thin-pool device and configure docker’s storage driver after installing docker but before you start using it. The script reads configuration options from the ///etc/sysconfig/docker-storage-setup// file.

Configure docker-storage-setup for your environment. There are three options available based on your storage configuration:

a) Create a thin-pool volume from the remaining free space in the volume group where your root filesystem resides; this requires no configuration:
<code># docker-storage-setup</code>

b) Use an existing volume group, in this example docker-vg, to create a thin-pool:
<code>
# echo <<EOF > /etc/sysconfig/docker-storage-setup
VG=docker-vg
SETUP_LVM_THIN_POOL=yes
DATA_SIZE=90%FREE
WIPE_SIGNATURES=true
EOF
# docker-storage-setup
</code>

c) Use an unpartitioned block device to create a new volume group and thinpool. In this example, the /dev/vdc device is used to create the docker-vg volume group:
<code>
# cat <<EOF > /etc/sysconfig/docker-storage-setup
DEVS=/dev/vdc
VG=docker-vg
DATA_SIZE=90%FREE
WIPE_SIGNATURES=true
EOF
# docker-storage-setup
</code>

Verify your configuration. You should have dm.thinpooldev value in the /etc/sysconfig/docker-storage file and a docker-pool device:
<code>
# lvs
LV                  VG        Attr       LSize  Pool Origin Data%  Meta% Move Log Cpy%Sync Convert
docker-pool         docker-vg twi-a-tz-- 48.95g             0.00   0.44
# cat /etc/sysconfig/docker-storage
DOCKER_STORAGE_OPTIONS=--storage-opt dm.fs=xfs --storage-opt dm.thinpooldev=/dev/mapper/docker--vg-docker--pool
</code>
Re-initialize docker.

**Warning** This will destroy any docker containers or images currently on the host.
<code>
    # systemctl stop docker
    # rm -rf /var/lib/docker/*
    # systemctl restart docker
</code>


===== Ansible Installer =====

On the master host, generate ssh keys to use for ansible press enter to accept the defaults

<code>
root@master# ssh-keygen
</code>

Distribue these keys to all hosts (including the master)

<code>
root@master# for host in ose3-master.example.com \
    ose3-node1.example.com \
    ose3-node2.example.com; \
    do ssh-copy-id -i ~/.ssh/id_rsa.pub $host; \
    done
</code>

Test passwordless ssh
<code>
root@master# for host in ose3-master.example.com \
    ose3-node1.example.com \
    ose3-node2.example.com; \
    do ssh $host hostname; \
    done
</code>

Make a backup of the // /etc/ansible/hosts // file
<code>
cp /etc/ansible/hosts{,.bak}
</code>

Next You must create an ///etc/ansible/hosts// file for the playbook to use during the installation

Sample Ansible Hosts files
  * [[https://raw.githubusercontent.com/christianh814/openshift-toolbox/master/ansible_hostfiles/singlemaster|Single Master]]
  * [[https://raw.githubusercontent.com/christianh814/openshift-toolbox/master/ansible_hostfiles/multimaster|Multi Master]]
  * [[https://raw.githubusercontent.com/christianh814/openshift-toolbox/master/ansible_hostfiles/awsinstall|AWS Install]]
  * [[https://raw.githubusercontent.com/christianh814/openshift-toolbox/master/ansible_hostfiles/glusterfs|GlusterFS Config]]

Sample HAProxy configs if you want to build your own HAProxy server
  * [[https://raw.githubusercontent.com/christianh814/openshift-toolbox/master/haproxy_config/haproxy.cfg|HAProxy Config]]
  * [[https://raw.githubusercontent.com/christianh814/openshift-toolbox/master/haproxy_config/haproxy-letsencrypt.cfg|HAProxy Config - Let's Encrypt]]

==== Running The Playbook ====

You can run the playbook (specifying a //-i// if you wrote the hosts file somewhere else)

<code>
root@master# ansible-playbook /usr/share/ansible/openshift-ansible/playbooks/byo/config.yml
</code>

Once this completes successfully, run //oc get nodes// and you should see "Ready"

<code>
root@master# oc get nodes
NAME                      LABELS                                           STATUS
ose3-master.example.com   kubernetes.io/hostname=ose3-master.example.com   Ready
ose3-node1.example.com    kubernetes.io/hostname=ose3-node1.example.com    Ready
ose3-node2.example.com    kubernetes.io/hostname=ose3-node2.example.com    Ready
</code> 

===== AWS Installer =====

This installer sets up OpenShift on AWS in a HA configuration. This is a summary of the [[https://access.redhat.com/articles/2623521|official documentation]]

In the end you'll have the following.

{{ ::ose-on-aws-architecture.jpg?1000 |}}

You will need the following to get started
  * An AWS IAM account
    * This account pretty much needs full access
    * AWS Secret Key
    * AWS Key ID
  * Delegate a Subdomain to AWS Route53
  * OpenShift Subs
  * A host to launch the commands from

==== Set Up Host ====

First install the following packages

<code>
subscription-manager register --username=christian.hernandez@redhat.com --auto-attach
subscription-manager repos --disable=*
subscription-manager repos --enable rhel-7-server-rpms
subscription-manager repos --enable rhel-7-server-optional-rpms
subscription-manager repos --enable rhel-7-server-ose-3.5-rpms
subscription-manager repos --enable rhel-7-fast-datapath-rpms
yum -y install yum-utils
yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
yum-config-manager --disable epel
yum -y install ansible atomic-openshift-utils
yum -y install --enablerepo=epel \
                 python2-boto \
                 python2-boto3 \
                 pyOpenSSL \
                 git \
                 python-netaddr \
                 python-click \
                 python-httplib2 vim bash-completion
</code>

Next, either copy or create an ssh-key; below is how to generate an SSH key (skip this if you already have one)

<code>
ssh-keygen
</code>

Create an ''~/.ssh/config'' file with the following (substitute your delegated domain and ssh key where appropriate)

<code>
Host bastion
     HostName                 bastion.aws.chx.cloud
     User                     ec2-user
     StrictHostKeyChecking    no
     ProxyCommand             none
     CheckHostIP              no
     ForwardAgent             yes
     IdentityFile             /root/.ssh/id_rsa

Host *.aws.chx.cloud
     ProxyCommand             ssh ec2-user@bastion -W %h:%p
     user                     ec2-user
     IdentityFile             /root/.ssh/id_rsa
</code> 

You are basically setting up a way to "tunnel" through your env.

Next, clone the repo

<code>
cd
git clone https://github.com/openshift/openshift-ansible-contrib.git
</code>

This env is going to use GitHub for auth. Create an Org (this is easy). Then Go to ''Settings ~> oAuth Applications'' and register a new app. I used the following settings

<code>
Homepage URL: https://openshift-master.aws.chx.cloud
Authorization callback URL: https://openshift-master.aws.chx.cloud/oauth2callback/github
</code>


==== Provision The Environment ====

To provision the env; you need to be in the right dir. Enter the dir and run the help menu. For the most, part it's well documented

<code>
cd
openshift-ansible-contrib/reference-architecture/aws-ansible
./ose-on-aws.py --help
</code>

I had to edit the following file ''~/openshift-ansible-contrib/reference-architecture/aws-ansible/inventory/aws/hosts/ec2.ini'' and change the entry (around line 14) ''regions = all'' to the entry below (substitute for your region). This is a current bug and you may not need to do this. Check the [[https://github.com/openshift/openshift-ansible-contrib/issues/369|issues]] page for info.

<code>
regions = us-east-1
</code>

Export your AWS env
<code>
export AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXX
export AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXXXX
</code>

I ran the following to provision the env. (I used TMUX so I can disconnect and comeback later)

<code>
./ose-on-aws.py \
--stack-name=ocp-chx \
--ami=ami-b63769a1 \
--region=us-east-1 \
--public-hosted-zone=aws.chx.cloud \
--app-dns-prefix=apps \
--rhsm-user=christian.hernandez@redhat.com \
--rhsm-password=rhsecret \
--rhsm-pool="Employee SKU" \ 
--github-client-secret=githubclientsecret \
--github-client-id=githubclientid \
--github-organization=openshift-tigerteam \
--keypair=chernand-ec2 \
--create-key=yes \
--key-path=/root/.ssh/id_rsa.pub
</code>

Things to note

  * If you want another github org just pass multiple ''--github-organization''
  * The ''--keypair'' is the NAME you want it in AWS
  * And ''--create-key'' means that you're going to upload this to AWS
  * The option ''--rhsm-pool'' cloud be //"60 Day Supported OpenShift Enterprise, 2 Cores Evaluation"//
==== Add A Node ====

Adding a node is easy. Just make sure you're in that same dir

<code>
./add-node.py \
--existing-stack=ocp-chx \
--rhsm-user=christian.hernandez@redhat.com \
--rhsm-password=rhsecret \
--public-hosted-zone=aws.chx.cloud \
--keypair=chernand-ec2 \
--rhsm-pool="Employee SKU" \
--use-cloudformation-facts \
--shortname=ose-app-node03 \
--subnet-id=subnet-67cefb05 
</code>

Two things to note
  * Use the proper ''--shortname'' - just look on AWS
  * The ''--subnet-id'' means what zone you want it in...makes sure it's what you want.
====== Post Installation Steps ======

After you get OSE installed; you need to perform some post installation steps

===== Package Exclude =====

Run this after install is done
<code>
atomic-openshift-excluder exclude
</code>

===== Schedule Master =====

Before you deploy a router/registry...you'll need to make the master scheduleable
<code>
root@master# oadm manage-node ose3-master.example.com --schedulable

</code>

===== Let's Encrypt =====

If you used [[let_s_encrypt|Let's Encrypt]], then create the proper symlinks

<code>
cd /etc/origin/master/named_certificates
rm fullchain.pem
rm privkey.pem
ln -s /etc/letsencrypt/live/ocp.52.14.195.108.nip.io/fullchain.pem
ln -s /etc/letsencrypt/live/ocp.52.14.195.108.nip.io/privkey.pem
systemctl restart atomic-openshift-master
</code>

Look into cron-ing the renew/ocp-restart for the certs. I have examples [[https://github.com/christianh814/openshift-toolbox/tree/master/certbot|here]]
===== Docker Registry =====

The registry stores docker images and metadata. If you simply deploy a pod with the registry, it will use an ephemeral volume that is destroyed once the pod exits. Any images anyone has built or pushed into the registry would disappear. That would be bad.

For now we will just show how to specify the directory and leave the NFS configuration as an exercise. On the master, as root...

<code>
root@master# oadm registry \
--config=/etc/origin/master/admin.kubeconfig \
--credentials=/etc/origin/master/openshift-registry.kubeconfig \
--service-account=registry \
--images='openshift3/ose-${component}:${version}' \
--selector="region=infra" \ 
--mount-host=/registry
</code>


Wait a few moments and your registry will be up. Test with:
<code>
root@master# curl -v $(oc get services | grep registry | awk '{print $4":"$5}/v2/' | sed 's,/[^/]\+$,/v2/,')
</code>

If you have a NFS server you'd like to use...

Deploy registry without the "--mount-host" option
<code>
root@master# oadm registry \
--config=/etc/origin/master/admin.kubeconfig \
--credentials=/etc/origin/master/openshift-registry.kubeconfig \
--service-account=registry \
--images='openshift3/ose-${component}:${version}' \
--selector="region=infra" 
</code>

Then specify backend nfs storage
<code>
root@master# oc volume deploymentconfigs/docker-registry --add --overwrite --name=registry-storage --mount-path=/registry --source='{"nfs": { "server": "<fqdn>", "path": "/path/to/export"}}'</code>

use a pv
<code>
oc volume deploymentconfigs/docker-registry --add --name=registry-storage -t pvc --claim-name=registry-pvc --overwrite</code>

There are known issues when using multiple registry replicas with the same NFS volume. We recommend changing the docker-registry service’s sessionAffinity to ClientAPI like this:
<code>
root@master# oc get -o yaml svc docker-registry | \
      sed 's/\(sessionAffinity:\s*\).*/\1ClientIP/' | \
      oc replace -f -
</code>

==== Connecting To Docker Registry ====

You can connect to the docker registry hosted by OpenShift. You can do this and do "pull" and "pushes" directly into the registry. Follow the steps below to get this behavior

=== Secure Registry ===

After you [[openshift_enterprise_3.x#docker_registry|deploy the registry]] find out the service IP:PORT mapping
<code>
[root@ose3-master ~]# oc get se docker-registry
NAME              LABELS                    SELECTOR                  IP(S)            PORT(S)
docker-registry   docker-registry=default   docker-registry=default   172.30.209.118   5000/TCP
</code>

Create a server certificate for the registry service IP and the fqdn that's going to be your route (in this example it's //** docker-registry.cloudapps.example.com **//):
<code>
[root@ose3-master ~]# CA=/etc/origin/master
[root@ose3-master ~]# oadm create-server-cert --signer-cert=$CA/ca.crt --signer-key=$CA/ca.key --signer-serial=$CA/ca.serial.txt --hostnames='docker-registry.cloudapps.example.com,172.30.209.118' --cert=registry.crt --key=registry.key
</code>

Create the secret for the registry certificates
<code>
[root@ose3-master ~]# oc secrets new registry-secret registry.crt registry.key
</code>

Add the secret to the registry pod’s service account (i.e., the "registry" service account)
<code>
[root@ose3-master ~]# oc secrets add serviceaccounts/registry secrets/registry-secret
</code>

Create the directory where the registry will mount the keys
<code>
[root@ose3-master ~]# mkdir /registry-secrets
[root@ose3-master ~]# cp registry.crt /registry-secrets
[root@ose3-master ~]# cp registry.key /registry-secrets
</code>


Add the secret volume to the registry deployment configuration
<code>
[root@ose3-master ~]# oc volume dc/docker-registry --add --type=secret --secret-name=registry-secret -m /registry-secrets 
</code>

Enable TLS by adding the following environment variables to the registry deployment configuration
<code>
oc env dc/docker-registry REGISTRY_HTTP_TLS_CERTIFICATE=/registry-secrets/registry.crt  REGISTRY_HTTP_TLS_KEY=/registry-secrets/registry.key
</code>

Validate the registry is running in TLS mode. Wait until the // docker-registry // pod status changes to //Running// and verify the docker logs for the registry container. You should find an entry for //listening on :5000, tls//
<code>
[root@ose3-master ~]# oc get pods
NAME                      READY     STATUS    RESTARTS   AGE
docker-registry-3-yqy8v   1/1       Running   0          25s
router-1-vhjdc            1/1       Running   1          2d
[root@ose3-master ~]# oc logs docker-registry-3-yqy8v | grep tls
time="2015-08-27T16:34:56-04:00" level=info msg="listening on :5000, tls" instance.id=440700c4-16e2-4725-81c5-5835f72c7119 
</code>

Copy the CA certificate to the docker certificates directory. This must be done on all nodes in the cluster
<code>
[root@ose3-master ~]# mkdir -p /etc/docker/certs.d/172.30.209.118:5000
[root@ose3-master ~]# mkdir -p /etc/docker/certs.d/docker-registry.cloudapps.example.com:5000
[root@ose3-master ~]# cp /etc/origin/master/ca.crt /etc/docker/certs.d/172.30.209.118\:5000/
[root@ose3-master ~]# cp /etc/origin/master/ca.crt /etc/docker/certs.d/docker-registry.cloudapps.example.com\:5000/
[root@ose3-master ~]# for i in ose3-node{1..2}.example.com; do ssh ${i} mkdir -p /etc/docker/certs.d/172.30.209.118\:5000; ssh ${i} mkdir -p /etc/docker/certs.d/docker-registry.cloudapps.example.com\:5000; scp /etc/origin/master/ca.crt root@${i}:/etc/docker/certs.d/172.30.209.118\:5000/; scp /etc/origin/master/ca.crt root@${i}:/etc/docker/certs.d/docker-registry.cloudapps.example.com\:5000/; done
</code>


=== Expose Registry ===

Now expose your registry

Create a route
<code>
[root@ose3-master ~]# oc expose svc/docker-registry --hostname=docker-registry.cloudapps.example.com
</code>

Next edit the route and add the TLS termination to be "passthrough"...in the end it should look like this
<code>
[root@ose3-master ~]# oc get route/docker-registry -o yaml 
apiVersion: v1
kind: Route
metadata:
  annotations:
    openshift.io/host.generated: "false"
  creationTimestamp: 2015-08-27T20:58:16Z
  labels:
    docker-registry: default
  name: docker-registry
  namespace: default
  resourceVersion: "9557"
  selfLink: /osapi/v1beta3/namespaces/default/routes/docker-registry
  uid: 56a78ac4-4cfe-11e5-9ae1-525400baad4f
spec:
  host: docker-registry.cloudapps.example.com
  tls:
    termination: passthrough
  to:
    kind: Service
    name: docker-registry
status: {}
</code>

=== Connect to the Registry ===

Copy the CA cert to the client
<code>
[root@ose3-master ~]# scp /etc/origin/master/ca.crt 172.16.1.251:/tmp/
</code>

On the client, copy the cert into the created directory
<code>
[christian@rhel7 ~]$ sudo mkdir /etc/docker/certs.d/docker-registry.cloudapps.example.com\:5000/
[christian@rhel7 ~]$ sudo cp /tmp/ca.crt /etc/docker/certs.d/docker-registry.cloudapps.example.com\:5000/
[christian@rhel7 ~]$ sudo cp -r /etc/docker/certs.d/docker-registry.cloudapps.example.com\:5000/ /etc/docker/certs.d/docker-registry.cloudapps.example.com
[christian@rhel7 ~]$ sudo systemctl restart docker
[christian@rhel7 ~]$ sudo systemctl restart docker
</code>

Obtain a key from oc (hey that rhymed!)
<code>
[christian@rhel7 ~]$ oc whoami -t
YMQeiPbrMNxgR9mWmSzr1utX7IIJWL-QSpnlBgK8XBU
</code>

Use this key to login
<code>
[christian@rhel7 ~]$ docker login -u christian -e chernand@redhat.com -p YMQeiPbrMNxgR9mWmSzr1utX7IIJWL-QSpnlBgK8XBU docker-registry.cloudapps.example.com
WARNING: login credentials saved in /home/christian/.docker/config.json
Login Succeeded
</code>

Test it by pulling busybox to one of your projects
<code>
[christian@rhel7 ~]$ oc get projects
NAME      DISPLAY NAME        STATUS
java      Java Applications   Active
myphp     PHP Applicaitons    Active
[christian@rhel7 ~]$ docker pull busybox
[christian@rhel7 ~]$ docker tag busybox docker-registry.cloudapps.example.com/myphp/mybusybox
[christian@rhel7 ~]$ docker push  docker-registry.cloudapps.example.com/myphp/mybusybox
</code>

On the master...verify that it's in the registry
<code>
[root@ose3-master ~]# oc get is -n myphp
</code>
===== Router =====

The OpenShift router is the ingress point for all traffic destined for services in your OpenShift installation.

First create the certificate that will be used for all default SSL connections
<code>
root@master# CA=/etc/origin/master
root@master# oadm ca create-server-cert --signer-cert=$CA/ca.crt --signer-key=$CA/ca.key --signer-serial=$CA/ca.serial.txt --hostnames='*.cloudapps.example.com' --cert=cloudapps.crt --key=cloudapps.key
root@master# cat cloudapps.crt cloudapps.key $CA/ca.crt > cloudapps.router.pem
</code>

Now create the router
<code>
root@master# oadm router --default-cert=cloudapps.router.pem --credentials='/etc/origin/master/openshift-router.kubeconfig' --selector='region=infra' --images='openshift3/ose-${component}:${version}' --service-account=router
</code>

===== Host Path =====

If you are going to add "hostPath" then you might need to do the following

<code>
oc edit scc privileged
</code>

And add under users
<code>
- system:serviceaccount:default:registry
- system:serviceaccount:default:docker
</code>

Maybe this will work too?

<code>
oadm policy add-scc-to-user privileged -z registry
oadm policy add-scc-to-user privileged -z router
</code>
===== Image Streams =====

Now that you have your router and docker-registry up and running you can populate OSE with ImageStreams (canned versions of docker images supported by Red hat)

"One Shot" command
<code>
root@master# cd /usr/share/openshift/
root@master# find examples/ -type f -name '*.json' -exec oc create -f {} -n openshift \;
</code>

**__NOTE__** You might run into a bug where you see the "registry" address like so
<code>
root@master# oc get is -n openshift
NAME                                  DOCKER REPO                                                                  TAGS                         UPDATED
jboss-amq-62                          registry.access.redhat.com/jboss-amq-6/amq62-openshift                       1.1,1.1-2,latest             26 minutes ago
jboss-eap64-openshift                 registry.access.redhat.com/jboss-eap-6/eap64-openshift                       1.1,1.1-2,latest             26 minutes ago
jboss-webserver30-tomcat7-openshift   registry.access.redhat.com/jboss-webserver-3/webserver30-tomcat7-openshift   latest,1.1,1.1-2             26 minutes ago
jboss-webserver30-tomcat8-openshift   registry.access.redhat.com/jboss-webserver-3/webserver30-tomcat8-openshift   1.1-3,latest,1.1             26 minutes ago
jenkins                               172.30.116.164:5000/openshift/jenkins                                        1,latest                     26 minutes ago
mongodb                               172.30.116.164:5000/openshift/mongodb                                        latest,2.4,2.6               26 minutes ago
mysql                                 172.30.116.164:5000/openshift/mysql                                          5.6,latest,5.5               26 minutes ago
nodejs                                172.30.116.164:5000/openshift/nodejs                                         0.10,latest                  26 minutes ago
perl                                  172.30.116.164:5000/openshift/perl                                           5.16,5.20,latest             26 minutes ago
php                                   172.30.116.164:5000/openshift/php                                            5.6,latest,5.5               26 minutes ago
postgresql                            172.30.116.164:5000/openshift/postgresql                                     9.4,latest,9.2               26 minutes ago
python                                172.30.116.164:5000/openshift/python                                         3.4,latest,2.7 + 1 more...   26 minutes ago
ruby                                  172.30.116.164:5000/openshift/ruby                                           2.2,2.0,latest               About a minute ago
wildfly                               172.30.116.164:5000/openshift/wildfly                                        8.1,latest                   About a minute ago
</code>

Fix this by doing the following
<code>
root@master# oc delete is --all -n openshift
root@master# oc create -f https://raw.githubusercontent.com/rhtconsulting/rhc-ose/openshift-enterprise-3/provisioning/templates/image-streams-rhel7-ose3_0_2.json -n openshift
root@master# oc create -n openshift -f /usr/share/openshift/examples/xpaas-streams/jboss-image-streams.json
root@master# oc get is -n openshift
NAME                                  DOCKER REPO                                                                  TAGS                                     UPDATED
jboss-amq-62                          registry.access.redhat.com/jboss-amq-6/amq62-openshift                       latest,1.1,1.1-2                         1 seconds ago
jboss-eap64-openshift                 registry.access.redhat.com/jboss-eap-6/eap64-openshift                       1.1,1.1-2,latest                         2 seconds ago
jboss-webserver30-tomcat7-openshift   registry.access.redhat.com/jboss-webserver-3/webserver30-tomcat7-openshift   latest,1.1,1.1-2                         3 seconds ago
jboss-webserver30-tomcat8-openshift   registry.access.redhat.com/jboss-webserver-3/webserver30-tomcat8-openshift   1.1,1.1-3,latest                         3 seconds ago
jenkins                               registry.access.redhat.com/openshift3/jenkins-1-rhel7                        1.6-3,1.609-14,1 + 1 more...             10 seconds ago
mongodb                               registry.access.redhat.com/openshift3/mongodb-24-rhel7                       v3.0.0.0,v3.0.1.0,v3.0.2.0 + 4 more...   11 seconds ago
mysql                                 registry.access.redhat.com/openshift3/mysql-55-rhel7                         5.5-8,v3.0.1.0,v3.0.2.0 + 4 more...      14 seconds ago
nodejs                                registry.access.redhat.com/openshift3/nodejs-010-rhel7                       v3.0.2.0,0.10,0.10-12 + 4 more...        20 seconds ago
perl                                  registry.access.redhat.com/openshift3/perl-516-rhel7                         v3.0.0.0,v3.0.1.0,v3.0.2.0 + 4 more...   19 seconds ago
php                                   registry.access.redhat.com/openshift3/php-55-rhel7                           v3.0.0.0,latest,v3.0.1.0 + 4 more...     17 seconds ago
postgresql                            registry.access.redhat.com/openshift3/postgresql-92-rhel7                    latest,v3.0.0.0,v3.0.1.0 + 2 more...     13 seconds ago
python                                registry.access.redhat.com/openshift3/python-33-rhel7                        3.1.0,3.3,3.3-13 + 4 more...             16 seconds ago
ruby                                  registry.access.redhat.com/openshift3/ruby-20-rhel7                          v3.0.1.0,v3.0.2.0,2.0-12 + 4 more...     22 seconds ago
</code>

===== LDAP Configuration =====

First (if using // ldaps //) you need to download the CA certificate (below example is using Red Hat IdM server)

<code>
root@master# curl  http://ipa.example.com/ipa/config/ca.crt >> /etc/origin/master/my-ldap-ca-bundle.crt
</code>

Make a backup copy of the config file
<code>
root@master# cp /etc/origin/master/master-config.yaml{,.bak}
</code>

Edit the // /etc/origin/master/master-config.yaml // file with the following changes under the // identityProviders // section

<code>
  identityProviders:
  - name: "my_ldap_provider"
    challenge: true
    login: true
    provider:
      apiVersion: v1
      kind: LDAPPasswordIdentityProvider
      attributes:
        id:
        - dn
        email:
        - mail
        name:
        - cn
        preferredUsername:
        - uid
      bindDN: "cn=directory manager"
      bindPassword: "secret"
      ca: my-ldap-ca-bundle.crt
      insecure: false
      url: "ldaps://ipa.example.com/cn=users,cn=accounts,dc=example,dc=com?uid"
</code>

Note you can customize what attributes it searches for. First non empty attribute returned is used.

Restart the openshift-master service
<code>
systemctl restart atomic-openshift-master
</code>

==== Active Directory ====

AD usually is using //sAMAccountName// as uid for login. Use the following ldapsearch to validate the informaiton

<code>
ldapsearch -x -D "CN=xxx,OU=Service-Accounts,OU=DCS,DC=homeoffice,DC=example,DC=com" -W -H ldaps://ldaphost.example.com -b "ou=Users,dc=office,dc=example,DC=com" -s sub 'sAMAccountName=user1'
</code>

If the ldapsearch did not return any user, it means -D or -b may not be correct. Retry different //baseDN//. If there is too many entries returns, add filter to your search. Filter example is //(objectclass=people)// or //(objectclass=person)// if still having issues; increase logging as //OPTIONS=--loglevel=5// in // /etc/sysconfig/atomic-openshift-master //

If you see an error in // journalctl -u atomic-openshift-master//  there might be a conflict with the user identity when user trying to login (if you used //htpasswd// beforehand). Just do the following...
<code>
oc get user oc delete user user1
</code>

Inspiration from :

  * [[https://access.redhat.com/solutions/2016873]]
  * [[https://access.redhat.com/solutions/1978013]]

The configuration in //master-config.yaml// Should look something like this:

<code>
oauthConfig:
  assetPublicURL: https://master.example.com:8443/console/
  grantConfig:
    method: auto
  identityProviders:
  - name: "OfficeAD"
    challenge: true
    login: true
    provider:
      apiVersion: v1
      kind: LDAPPasswordIdentityProvider
      attributes:
        id:
        - dn
        email:
        - mail
        name:
        - cn
        preferredUsername:
        - sAMAccountName
      bindDN: "CN=LinuxSVC,OU=Service-Accounts,OU=DCS,DC=office,DC=example,DC=com"
      bindPassword: "password"
      ca: ad-ca.pem.crt
      insecure: false
      url: "ldaps://ad-server.example.com:636/CN=Users,DC=hoffice,DC=example,DC=com?sAMAccountName?sub"
</code>

If you need to look for a subclass...

<code>
"ldaps://ad.corp.example.com:636/OU=Users,DC=corp,DC=example,DC=com?sAMAccountName?sub?(&(objectClass=person)"
</code>

==== Two Auth Provider ====

Here is an example of using two auth providers
<code>
  identityProviders:
  - challenge: true
    login: true
    mappingMethod: claim
    name: htpasswd_auth
    provider:
      apiVersion: v1
      file: /etc/origin/master/htpasswd
      kind: HTPasswdPasswordIdentityProvider
  - challenge: true
    login: true
    mappingMethod: claim
    name: htpasswd_auth2
    provider:
      apiVersion: v1
      file: /etc/origin/master/htpasswd2
      kind: HTPasswdPasswordIdentityProvider
</code>
===== Users =====

==== Create User ==== 

The ansible scripts configured authentication using // htpasswd // so just create the users using the proper method

<code>
root@host# htpasswd -b /etc/origin/openshift-passwd demo demo
</code>

==== Adding User to group ====

Currently, you can only add a user to a group by setting the "group" array to a group
<code>
[root@ose3-master ~]# oc edit user/christian -o json
{
    "kind": "User",
    "apiVersion": "v1",
    "metadata": {
        "name": "christian",
        "selfLink": "/osapi/v1beta3/users/christian",
        "uid": "a5c96638-4084-11e5-8a3c-fa163e2e3caf",
        "resourceVersion": "1182",
        "creationTimestamp": "2015-08-11T23:56:56Z"
    },
    "identities": [
        "htpasswd_auth:christian"
    ],
    "groups": [
        "mygroup"
    ]
}

</code>

====== Misc ======

Misc info in no particular order

===== Promotion =====

Rough notes taken from... https://blog.openshift.com/promoting-applications-across-environments/

==== Create a new Project ====

Here are the commands used to create a new project with name “development” and providing “edit” access to developer and “view” access to the tester.
<code>
oc new-project development —display-name="Development Project"
oc policy add-role-to-user edit dev1
oc policy add-role-to-user view test1
</code>
==== Create a QA project ====

Commands needed to create a QA project and provide “edit’ access to the tester.
<code>
oc new-project testing —display-name="QA Project"
oc policy add-role-to-user edit test1
</code>

==== Enable the test project to pull development images ====

Assigning the ''system:image-puller'' role to the service account “testing” which is the default service account for the testing project on the development project. By doing this, we are enabling the testing project to be able to pull images from the development project.
<code>
oc policy add-role-to-group system:image-puller system:serviceaccounts:testing -n development
</code>
==== Create an application in development ====

Switch over as developer and create an application in the development project.
<code>
oc login -u dev1
oc project development
oc new-app --template=eap6-basic-sti -p APPLICATION_NAME=myapp,APPLICATION_HOSTNAME=myapp-dev.apps.demov3.osecloud.com,EAP_RELEASE=6.4,GIT_URI=https://github.com/VeerMuchandi/kitchensink.git,GIT_REF=,GIT_CONTEXT_DIR= -l name=myapp
</code>
==== Identifying the image id ====

Finding the image stream name and identifying the full image id.
<code>
oc get is
oc describe is
</code>
The ''describe is'' command will show the full image id. You can copy that into clipboard. Use that to tag the specific image to promote.
<code>
oc tag development/myapp:promote
</code>
==== Deploy an application in the test project ====

Login as tester and deploy an application in the “testing” project.
<code>
oc login -u test1
oc project testing
oc new-app development/myapp:promote
</code>
Note the service name and create a route.
<code>
oc get svc
oc expose svc
</code>

==== Quick Notes ====

Add two users
<code>
 htpasswd -b /etc/origin/openshift-passwd qa qa
 htpasswd -b /etc/origin/openshift-passwd dev dev
</code>

As QA
<code>
qa@host$ oc new-project qa
qa@host$ oc new-app openshift/php~https://github.com/RedHatWorkshops/welcome-php.git
qa@host$ oc get is
</code>

As DEV
<code>
dev@host$ oc new-project dev
</code>

As Admin use the syntax

''oc policy add-role-to-group system:image-puller system:serviceaccounts:**$PROJECT_YOU_WANT_TO_PULL_TO** -n **$PROJECT_YOU_WANT_TO_PULL_FROM** ''

''oc policy add-role-to-user view **$USER_THAT_OWNS_THE_PROJECT_YOU_WANT_TO_PULL_TO** -n **$PROJECT_YOU_WANT_TO_PULL_FROM**''
<code>
root@master# oc policy add-role-to-group system:image-puller system:serviceaccounts:dev -n qa
root@master# oc policy add-role-to-user view dev -n qa
</code>

As DEV
<code>
dev@host$ oc new-app qa/welcome-php
</code>
===== Cluster Metrics =====

To install Metrics

<code>
ansible-playbook /usr/share/ansible/openshift-ansible/playbooks/byo/openshift-cluster/openshift-metrics.yml \
-e openshift_metrics_install_metrics=True \
-e openshift_metrics_hawkular_hostname=hawkular.apps.172.16.1.10.nip.io \
-e openshift_metrics_cassandra_storage_type=dynamic \
-e openshift_metrics_cassandra_pvc_size=10Gi
</code>

nice one liner to keep all your metrics stuff on the infra nodes
<code>
oc patch ns openshift-infra -p '{"metadata": {"annotations": {"openshift.io/node-selector": "region=infra"}}}'
</code>

To uninstall

<code>
ansible-playbook /usr/share/ansible/openshift-ansible/playbooks/byo/openshift-cluster/openshift-metrics.yml \
-e openshift_metrics_install_metrics=False
</code>


===== Logging =====

To Install
<code>
ansible-playbook /usr/share/ansible/openshift-ansible/playbooks/byo/openshift-cluster/openshift-logging.yml \
-e openshift_logging_kibana_hostname=kibana.apps.172.16.1.10.nip.io \
-e openshift_logging_install_logging=true \
-e openshift_logging_es_pvc_dynamic=true \
-e openshift_logging_es_pvc_size=10Gi

</code>

To uninstall
<code>
ansible-playbook /usr/share/ansible/openshift-ansible/playbooks/byo/openshift-cluster/openshift-logging.yml \
-e openshift_logging_install_logging=False
</code>
===== Login =====

==== User Login ====
To login

<code>
user@host$ oc login https://ose3-master.example.com:8443 --insecure-skip-tls-verify --username=demo
</code>

==== Admin Login ====

On the master

<code>
root@master# oc login -u system:admin -n default
</code>

Or

<code>
 oc login --config=/path/to/admin.kubeconfig -u system:admin
</code>
===== Projects =====

To create a project as a user run the following command.
<code>
user@host$ oc new-project demo --display-name="Demo Projects" --description="Demo projects go here"
</code>

If you're an OSE admin and want to create a project and assign a user to it with the //--admin=${user}// command.
<code>
root@master# oadm new-project demo --display-name="OpenShift 3 Demo" --description="This is the first demo project with OpenShift v3" --admin=joe
</code>

===== Create App =====

This is an example PHP-application you can use to test your OSEv3 environment.

Here is an example:
<code>
user@host$ oc new-app openshift/php~https://github.com/christianh814/php-example-ose3
</code>

Things to keep in mind:
  * //ose new-app// Creates a new application on OSE3
  * //openshift/php// This tells OSEv3 to use the PHP image stream provided by OSE
  * Provide the git URL for the project
    * Syntax is "//**imagestream**~**souce**//"

Once you created the app, start your build
<code>
user@host$ oc start-build php-example-ose3
</code>

View the build logs if you wish. Note the //-1// ...this is the build number. Find the build number with //oc get builds//
<code>
user@host$ oc build-logs php-example-ose3-1
</code>

Once the build completes; create and add your route:
<code>
user@host$ oc expose service php-example-ose3 --hostname=php-example.cloudapps.example.com
</code>


Scale up as you wish
<code>
user@host$ oc scale --replicas=3 dc/php-example-ose3
</code>

If you'd like to add another route (aka "alias"); then you need to specify a new name for it
<code>
user@host$ oc expose service php-example-ose3 --name=hello-openshift --hostname=hello-openshift.cloudapps.example.com
</code>

If you want to add SSL to your app.

<code>
oc create route edge --service=auth --cert=fullchain1.pem --key=privkey1.pem  --hostname=auth.myweb.io
</code>

Note: To see what imageStreams are available to you...
<code>
user@host$  oc get imageStreams -n openshift
</code>

Enter Container

Enter your container with the //oc rsh// command
<code>
user@host$  oc rsh ${podID} 
</code>

Create an app with a 'Dockerfile' in github
<code>
user@host$ oc new-app https://github.com/christianh814/ose3-ldap-auth --strategy=docker --name=auth -l appname=auth
</code>

Use Template for JBOSS
<code>
user@host$ git clone https://github.com/openshift/openshift-ansible
user@host$ cd openshift-ansible/roles/openshift_examples/files/examples/xpaas-templates/
user@host$ oc process -f eap6-basic-sti.json -v APPLICATION_NAME=ks,APPLICATION_HOSTNAME=ks.demo.sbx.osecloud.com,GIT_URI=https://github.com/RedHatWorkshops/kitchensink,GIT_REF="",GIT_CONTEXT_DIR="" | oc create -f -
</code>

Custom Service
<code>
user@host$ oc expose dc/basicauthurl --port=443 --generator=service/v1 -n auth
</code>
===== Rolling Deployments =====

By default, when a new build is fired off it will stop the application while the new container is created. You can change the deployment time on an app

<code>
user@host$ oc edit dc/php-example-ose3
</code>

Change the //Strategy// to //Rolling//

===== Health Checks =====

Readiness Probe: The kubelet uses a web hook to determine the healthiness of the container. The check is deemed successful if the hook returns with 200 or 399. 

Liveness Probe: The kubelet attempts to open a socket to the container. The container is only considered healthy if the check can establish a connection

You can add liveness/rediness probe from the cli
<code>
oc set probe dc/ks-stage --liveness --readiness --initial-delay-seconds=10 --timeout-seconds=60 --open-tcp=8080 
</code>

===== Build Webhooks =====

You can trigger a build using the generic webhook (there is one for github too)

<code>
curl -i -H "Accept: application/json" -H "X-HTTP-Method-Override: PUT" -X POST -k https://ose3-master.example.com:8443/osapi/v1beta3/namespaces/wiring/buildconfigs/ruby-example/webhooks/secret101/generic
</code>

===== Run Dockerhub Images =====

In order to run Dockerhub images you need to lift the security in your cluster so that images are not forced to run as a pre-allocated UID, without granting everyone access to the privileged SCC, you can edit the restricted SCC and change the //**runAsUser**// strategy:

<code>
root@master# oc edit scc restricted
</code>


...Change **//runAsUser//** Type to //**RunAsAny**//.

	

**//__WARING:__//**This allows images to run as the root UID if no USER is specified in the Dockerfile.

Now you can pull docker images
<code>
user@host$ oc new-app fedora/apache --name=apache
user@host$ oc expose service apache
</code>

Another (better?) way
<code>
oc project ticketmonster-microservices
oc adm policy add-scc-to-user privileged system:serviceaccount:ticketmonster-microservices 
</code>

Make privileged containers by default on a project
<code>
oc project myproject
oc adm policy add-scc-to-user privileged -z default
</code>

More notes

<code>
oc adm policy add-scc-to-user anyuid -z default
</code>

Or
<code>
oc project myproject
oc create serviceaccount useroot
oc adm policy add-scc-to-user anyuid -z useroot
oc patch dc/myAppNeedsRoot --patch '{"spec":{"template":{"spec":{"serviceAccountName": "useroot"}}}}'
</code>

To let the whole project run as root...

<code>
oc annotate namespace myproject openshift.io/scc=privileged
</code>
===== SSH Key For Git =====

Create the secret first before using the SSH key to access the private repository:
<code>
$ oc secrets new scmsecret ssh-privatekey=$HOME/.ssh/id_rsa
</code>

Add the secret to the builder service account:
<code>
$ oc secrets add serviceaccount/builder secrets/scmsecret
</code>
Add a sourceSecret field into the source section inside the buildConfig and set it to the name of the secret that you created, in this case scmsecret:
<code>
{
  "apiVersion": "v1",
  "kind": "BuildConfig",
  "metadata": {
    "name": "sample-build",
  },
  "parameters": {
    "output": {
      "to": {
        "name": "sample-image"
      }
    },
    "source": {
      "git": {
        "uri": "git@repository.com:user/app.git" 
      },
      "sourceSecret": {
        "name": "scmsecret"
      },
      "type": "Git"
    },
    "strategy": {
      "sourceStrategy": {
        "from": {
          "kind": "ImageStreamTag",
          "name": "python-33-centos7:latest"
        }
      },
      "type": "Source"
    }
  }
</code>
The URL of private repository is usually in the form // git@example.com:<username>/<repository> //

===== Liveness Check for Apps =====

If A pod dies kubernetes will fire the pod back up.

But what if the pod is running but the application (pid) inside is hung or dead? Kubernetes needs a way to monitor the application.

This is done with a "health check" outlined [[https://github.com/GoogleCloudPlatform/kubernetes/tree/master/docs/user-guide/liveness|here]]

First edit the deploymentConfig
<code>
user@host$ oc edit dc/myapp -o yaml
</code>

Inside "containers" and just after "image" add the following
<code>
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      timeoutSeconds: 1
</code>

In the end it should look something like this...

<code>
apiVersion: v1
kind: DeploymentConfig
metadata:
  creationTimestamp: 2015-07-30T16:15:16Z
  labels:
    appname: myapp
  name: myapp
  namespace: demo
  resourceVersion: "255603"
  selfLink: /osapi/v1beta3/namespaces/demo/deploymentconfigs/myapp
  uid: 2a7f06f8-36d6-11e5-ba31-fa163e2e3caf
spec:
  replicas: 1
  selector:
    deploymentconfig: myapp
  strategy:
    resources: {}
    type: Recreate
  template:
    metadata:
      creationTimestamp: null
      labels:
        deploymentconfig: myapp
    spec:
      containers:
      - env:
        - name: PEARSON
          value: value
        image: 172.30.182.253:5000/demo/myapp@sha256:fec918b3e488a5233b2840e1c8db7d01ee9c2b9289ca0f69b45cfea955d629b2
        imagePullPolicy: Always
        livenessProbe:
          httpGet:
            path: /info.php
            port: 8080
          initialDelaySeconds: 15
          timeoutSeconds: 1
        name: myapp
        ports:
        - containerPort: 8080
          name: myapp-tcp-8080
          protocol: TCP
        resources: {}
        securityContext:
          capabilities: {}
          privileged: false
        terminationMessagePath: /dev/termination-log
      dnsPolicy: ClusterFirst
      restartPolicy: Always
  triggers:
  - type: ConfigChange
  - imageChangeParams:
      automatic: true
      containerNames:
      - myapp
      from:
        kind: ImageStreamTag
        name: myapp:latest
      lastTriggeredImage: 172.30.182.253:5000/demo/myapp@sha256:fec918b3e488a5233b2840e1c8db7d01ee9c2b9289ca0f69b45cfea955d629b2
    type: ImageChange
status:
  details:
    causes:
    - type: ConfigChange
  latestVersion: 8

</code>


===== REST API Notes =====

**//NOTE: These are QND Notes!//**

First get a token 
<code>
oc whoami -t
</code>

Use that token to list (GET) things
<code>
 curl -X GET -H "Authorization: Bearer vfNbv3DvRSyL456b1Tfy0GNoRt80tba123znqQmG6Sg" -k https://ocp.chx.cloud:8443/oapi/v1/namespaces/ks-dev/routes
</code>

Create a "robot" user and use that token

<code>
$ oc create serviceaccount robot

$ oc policy add-role-to-user admin system:serviceaccount:test:robot

$ oc describe serviceaccount robot
Name:		robot
Namespace:	test
Labels:		<none>

Image pull secrets:	robot-dockercfg-rdrpg

Mountable secrets: 	robot-token-2dsne
                   	robot-dockercfg-rdrpg

Tokens:            	robot-token-2dsne

$  oc describe secret robot-token-2dsne
Name:		robot-token-2dsne
Namespace:	test
Labels:		<none>
Annotations:	kubernetes.io/service-account.name=robot,kubernetes.io/service-account.uid=ea70e4c7-0663-11e6-b279-fa163e610e01

Type:	kubernetes.io/service-account-token

Data
===
token:		fyJhbGciOiJSUzI1NiIyInR5cCI2IkpXVCJ9...
ca.crt:		1070 bytes
namespace:	8 bytes
</code>

Below may be deprecated....

Do things with "POST"...fireoff a build example
<code>
curl -X POST  -H "Authorization: Bearer vfNbv3DvRSyL456b1Tfy0GNoRt80tba123znqQmG6Sg" -k "https://ose3-master.sandbox.osecloud.com:8443/oapi/v1/namespaces/demo/buildconfigs/myapp/instantiate" -d '{"kind":"BuildRequest","apiVersion":"v1","metadata":{"name":"myapp","creationTimestamp":null}}'
</code>


===== Health Checks =====

router
<code>   curl http://ose3-master.example.com:1936/healthz </code>

Api
<code>  curl --cacert /etc/origin/master/master.server.crt https://ose3-master.example.com:8443/healthz</code>

===== RHEL Tools Pod =====

One time running of a RHEL pod with useful tools

<code>
oc run rheltest --image=registry.access.redhat.com/rhel7/rhel-tools --restart=Never --attach -i --tty
</code>
===== Node Selector =====

For some reason you now have to...

<code>
oc edit namespace default
</code>

and add...

<code>
openshift.io/node-selector: region=infra
</code>

In 3.2; you can do this from the command line

<code>
root@master# oc annotate namespace default openshift.io/node-selector=region=infra
</code>
===== RoundRobbin/Sticky Routing =====


By default the route does leastconn with sticky sessions. Annotate with roundrobbin/cookies to disable it.

<code>
oc annotate route/myapp haproxy.router.openshift.io/balance=roundrobin
oc annotate route/myapp haproxy.router.openshift.io/disable_cookies=true
</code>

To do sticky set it to..
<code>
oc annotate route/myapp haproxy.router.openshift.io/balance=source</code>
===== Jenkins Pipelines =====

Quick and Dirty Jenkins notes
<code>
[root@ose3-master ~]# cat pipelines_notes.txt 
oadm policy add-cluster-role-to-group system:build-strategy-jenkinspipeline system:authenticated

[root@ose3-master ~]# cat /etc/origin/master/pipelines.js 
window.OPENSHIFT_CONSTANTS.ENABLE_TECH_PREVIEW_FEATURE.pipelines = true;

[root@ose3-master ~]# grep -B15 'pipelines.js' /etc/origin/master/master-config.yaml 
assetConfig:
  logoutURL: ""
  masterPublicURL: https://ose3-master.example.com:8443
  publicURL: https://ose3-master.example.com:8443/console/
  servingInfo:
    bindAddress: 0.0.0.0:8443
    bindNetwork: tcp4
    certFile: master.server.crt
    clientCA: ""
    keyFile: master.server.key
    maxRequestsInFlight: 0
    requestTimeoutSeconds: 0
  metricsPublicURL: "https://hawkular.cloudapps.example.com/hawkular/metrics"
  loggingPublicURL: "https://kibana.cloudapps.example.com"
  extensionScripts:
  - /etc/origin/master/pipelines.js


oc create -f https://raw.githubusercontent.com/openshift/origin/master/examples/image-streams/image-streams-centos7.json -n openshift
oc create -f https://raw.githubusercontent.com/openshift/origin/master/examples/jenkins/jenkins-ephemeral-template.json -n openshift
oc create -f https://raw.githubusercontent.com/openshift/origin/master/examples/jenkins/jenkins-persistent-template.json -n openshift

# as user
oc login
oc new-poroject jenkins-pipeline
oc new-app jenkins-persistent
     * With parameters:
        * Jenkins Service Name=jenkins
        * Jenkins JNLP Service Name=jenkins-jnlp
        * Jenkins Password=ovuv0M3So0U3LCgw # generated
        * Memory Limit=512Mi
        * Volume Capacity=1Gi
        * Jenkins ImageStream Namespace=openshift
        * Jenkins ImageStreamTag=jenkins:latest

oc new-app -f https://raw.githubusercontent.com/openshift/origin/master/examples/jenkins/pipeline/samplepipeline.json


# as root on master https://docs.openshift.com/container-platform/3.3/install_config/configuring_pipeline_execution.html#overview

[root@ose3-master ~]# grep -A10 jenkinsPipelineConfig /etc/origin/master/master-config.yaml 
jenkinsPipelineConfig:
  autoProvisionEnabled: true 
  templateNamespace: openshift 
  templateName: jenkins-ephemeral
  serviceName: jenkins
  parameters: null
</code>
<code>
###
# Jenkins to control different env
###

oc policy add-role-to-user edit system:serviceaccount:cicd:jenkins -n ks-dev
oc policy add-role-to-user edit system:serviceaccount:cicd:jenkins -n ks-prod
oc policy add-role-to-group system:image-puller system:serviceaccounts:ks-prod -n ks-dev
</code>
===== NFS For Persistent Storage =====

You can provision your OpenShift cluster with persistent storage using NFS. The Kubernetes persistent volume framework allows administrators to provision a cluster with persistent storage and gives users a way to request those resources without having any knowledge of the underlying infrastructure.

==== Adding Storage: Master ====

Example:
<code>
{
  "apiVersion": "v1",
  "kind": "PersistentVolume",
  "metadata": {
    "name": "pv0001"
  },
  "spec": {
    "capacity": {
        "storage": "20Gi"
        },
    "accessModes": [ "ReadWriteMany" ],
    "nfs": {
        "path": "/var/export/vol1",
        "server": "nfs.example.com"
    }
  }
}
</code>

Create this object as the root (administrative) user
<code>
root@master# oc create -f pv0001.json 
persistentvolumes/pv0001
</code>

This defines a volume for OpenShift projects to use in deployments. The storage should correspond to how much is actually available (make each volume a separate filesystem if you want to enforce this limit). Take a look at it now:

<code>
root@master# oc describe persistentvolumes/pv0001
Name:		pv0001
Labels:		<none>
Status:		Available
Claim:		
Reclaim Policy:	%!d(api.PersistentVolumeReclaimPolicy=Retain)
Message:	%!d(string=)
</code>


==== Adding Storage: Client ====

Before you add the PV make sure you allow containers to mount NFS volumes
<code>
root@master# setsebool -P virt_use_nfs=true
root@node1#  setsebool -P virt_use_nfs=true
root@node2#  setsebool -P virt_use_nfs=true
</code>

Now that the administrator has provided a PersistentVolume, any project can make a claim on that storage. We do this by creating a PersistentVolumeClaim that specifies what kind and how much storage is desired:
<code>
{
  "apiVersion": "v1",
  "kind": "PersistentVolumeClaim",
  "metadata": {
    "name": "claim1"
  },
  "spec": {
    "accessModes": [ "ReadWriteMany" ],
    "resources": {
      "requests": {
        "storage": "20Gi"
      }
    }
  }
}
</code>

We can have alice do this in the project you created:
<code>
user@host$ oc create -f pvclaim.json 
persistentvolumeclaims/claim1
</code>

This claim will be bound to a suitable PersistentVolume (one that is big enough and allows the requested accessModes). The user does not have any real visibility into PersistentVolumes, including whether the backing storage is NFS or something else; they simply know when their claim has been filled ("bound" to a PersistentVolume).

<code>
user@host$ oc get pvc
NAME      LABELS    STATUS    VOLUME
claim1    map[]     Bound     pv0001
</code>

Finally, we need to modify the DeploymentConfig to specify that this volume should be mounted 
<code>
user@host$ oc edit dc/jenkins -o json
</code>

You'll notice in the // ** spec: volumes: ** // section that there is an //** "emptyDir" **// conifg there. Change it so you refer to your "claim1" you did above. Should look like this
<code>
            "spec": {
                "volumes": [
                    {
                        "name": "jenkins-16-centos7-volume-1",
                        "persistentVolumeClaim": { "claimName": "claim1" }
                    }
                ],
</code>

Verify by scrolling down and seeing that the config in-fact does use //** jenkins-16-centos7-volume-1 **// 
<code>
 "volumeMounts": [
                            {
                                "name": "jenkins-16-centos7-volume-1",
                                "mountPath": "/var/lib/jenkins"
                            }
                        ],
</code>

**__OR__** you can do it from the cli
<code>
oc volumes dc/gogs --add --claim-name=gogs-repos-claim --mount-path=/home/gogs/gogs-repositories -t persistentVolumeClaim 
oc volumes dc/gogs-postgresql --add --name=pgsql-data --claim-name=pgsql-claim --mount-path=/var/lib/pgsql/data -t persistentVolumeClaim --overwrite
</code>

===== OC CLUSTER UP =====

QnD

1)__ Download latest__ // oc // client 

https://github.com/openshift/origin/releases

2a) __Temp setup__
<code>
yum -y install docker
sed -i '/OPTIONS=.*/c\OPTIONS="--selinux-enabled --insecure-registry 172.30.0.0/16"' /etc/sysconfig/docker
systemctl enable docker
systemctl start docker
NETWORKSPACE=$(docker network inspect -f "{{range .IPAM.Config }}{{ .Subnet }}{{end}}" bridge)
firewall-cmd --permanent --new-zone dockerc
firewall-cmd --permanent --zone dockerc --add-source ${NETWORKSPACE}
firewall-cmd --permanent --zone dockerc --add-port 8443/tcp
firewall-cmd --permanent --zone dockerc --add-port 53/udp
firewall-cmd --permanent --zone dockerc --add-port 8053/udp
firewall-cmd --permanent --zone public --add-port 8443/tcp
firewall-cmd --permanent --zone public --add-port 443/tcp
firewall-cmd --permanent --zone public --add-port 80/tcp
firewall-cmd --permanent --zone public --add-port 53/udp
firewall-cmd --permanent --zone public --add-port 8053/udp
firewall-cmd --reload
oc cluster up --metrics=true --logging=true --public-hostname console.$DOMAIN --routing-suffix apps.$DOMAIN
</code>

2b) __Save config for later__
<code>
yum -y install docker
sed -i '/OPTIONS=.*/c\OPTIONS="--selinux-enabled --insecure-registry 172.30.0.0/16"' /etc/sysconfig/docker
systemctl enable docker
systemctl start docker
NETWORKSPACE=$(docker network inspect -f "{{range .IPAM.Config }}{{ .Subnet }}{{end}}" bridge)
firewall-cmd --permanent --new-zone dockerc
firewall-cmd --permanent --zone dockerc --add-source ${NETWORKSPACE}
firewall-cmd --permanent --zone dockerc --add-port 8443/tcp
firewall-cmd --permanent --zone dockerc --add-port 53/udp
firewall-cmd --permanent --zone dockerc --add-port 8053/udp
firewall-cmd --permanent --zone public --add-port 8443/tcp
firewall-cmd --permanent --zone public --add-port 443/tcp
firewall-cmd --permanent --zone public --add-port 80/tcp
firewall-cmd --permanent --zone public --add-port 53/udp
firewall-cmd --permanent --zone public --add-port 8053/udp
firewall-cmd --reload
mkdir -m 777 -p /ocp-storage/{host-config-dir,host-data-dir,host-volumes-dir}
oc cluster up --metrics=true --logging=true --public-hostname console.$DOMAIN --routing-suffix apps.$DOMAIN \
--host-config-dir=/ocp-storage/host-config-dir \
--host-data-dir=/ocp-storage/host-data-dir \
--host-volumes-dir=/ocp-storage/host-volumes-dir
</code>

3) __Optional (but helpful!) stuff__

If you want other versions try this
<code>
oc cluster up ... \
--image=registry.access.redhat.com/openshift3/ose --version=v3.4.1.5
</code>

If you want your data from above to persist...

<code>
oc cluster up ... \
--use-existing-config
</code>

Newer versions have this handy
<code>
oc cluster up ... \
 --host-pv-dir=/ocp-storage/openshift.local.pv
</code>
===== Dynamic Cloud Storage =====

These notes assume you got the cloud plugin working (aws, gce, azure, etc)

==== AWS ====

Info here:
  * https://docs.openshift.com/container-platform/latest/install_config/persistent_storage/dynamically_provisioning_pvs.html#aws-elasticblockstore-ebs

As an admin on the master.

<code>
[root@ip-172-31-22-210 ~]# cat aws-ebs-class.yaml 
kind: StorageClass
apiVersion: storage.k8s.io/v1beta1
metadata:
  name: aws-slow
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
  zone: us-west-1b
  iopsPerGB: "10" 
  encrypted: "false"
[root@ip-172-31-22-210 ~]# oc create -f aws-ebs-class.yaml 
storageclass "aws-slow" created
[root@ip-172-31-22-210 ~]# oc get storageclass 
NAME       TYPE
aws-slow   kubernetes.io/aws-ebs
</code>

Now on the client side
<code>
[chernand@chernand ~]$ cat aws-ebs.yaml 
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
 name: gogs-claim
 annotations:
   volume.beta.kubernetes.io/storage-class: aws-slow
spec:
 accessModes:
  - ReadWriteOnce
 resources:
   requests:
     storage: 10Gi
[chernand@chernand ~]$ oc create -f aws-ebs.yaml 
persistentvolumeclaim "gogs-claim" created
[chernand@chernand ~]$ oc get pvc
NAME         STATUS    VOLUME                                     CAPACITY   ACCESSMODES   AGE
gogs-claim   Bound     pvc-a3268768-dea9-11e6-b791-02d2b538cbc2   10Gi       RWO           2s
</code>

You should be able to see it on the server side now
<code>
[root@ip-172-31-22-210 ~]# oc get pv
NAME                                       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS    CLAIM              REASON    AGE
pvc-a3268768-dea9-11e6-b791-02d2b538cbc2   10Gi       RWO           Delete          Bound     infra/gogs-claim             10s

</code>

To setup a default class
<code>
[root@ip-172-31-22-210 ~]# cat aws-ebs-class-default.yaml 
kind: StorageClass
apiVersion: storage.k8s.io/v1beta1
metadata:
  name: aws-ebs-default
  annotations:
    storageclass.beta.kubernetes.io/is-default-class: "true"
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
  zone: us-west-1b
  iopsPerGB: "100" 
  encrypted: "false"
</code>

Or you can do it the easy way
<code>
oc annotate storageclass glusterfs-storage storageclass.beta.kubernetes.io/is-default-class="true"
</code>
===== Import Images =====
You can import images to the internal registry like so...

<code>
oc import-image openshift/openjdk18-openshift --from=registry.access.redhat.com/redhat-openjdk-18/openjdk18-openshift --confirm -n openshift
</code>

===== Container Native Storage =====

This is the [[https://access.redhat.com/documentation/en-us/red_hat_gluster_storage/3.1/html-single/container-native_storage_for_openshift_container_platform/|Official Documentation]]

Here are [[https://github.com/christianh814/openshift-toolbox/tree/master/cns|my notes.]]
   

===== JSON Path =====

Get specific items with ''jsonpath''

<code>
oc get secrets registry-config -n default -o jsonpath='{.data.config\.yml}{"\n"}' | base64 -d
</code>

This is how I got route info
<code>
oc get route -n openshift-infra -o jsonpath='{.items[*].spec.tls.termination}{"\n"}'
</code>

Just do this and "follow the path"

<code>
oc get <resource> -o json
</code>

Good info [[http://sferich888.blogspot.com/2017/01/learning-using-jsonpath-with-openshift.html|here]]

===== Custom Roles =====

More info found [[http://playbooks-rhtconsulting.rhcloud.com/playbooks/operationalizing/custom_role_creation.html|here]]

Highlevel; find something like what you want and export it.

<code>
oc export clusterrole edit > edit_role.yaml
cp edit_role.yaml customrole.yaml
</code>

Edit to your hearts content (I did a ''diff'' here to show you the change)
<code>
diff edit_role.yaml customrole.yaml 

8c8
<   name: edit
---
>   name: edit_no_rsh
16d15
<   - pods/exec
</code>

Above you see I changed the name and removed ''pods/exec''

Load the new role
<code>
oc create -f customrole.yaml 
clusterrole "edit_no_rsh" created
</code>

Assign to a user

<code>
oc adm policy add-role-to-user edit_no_rsh bob -n myproject</code>

===== Admin User =====

First create a user on ldap/htpasswd file.
<code>
htpasswd /etc/origin/openshift-passwd admin
</code>

Then add this user as a ''cluster-admin''

<code>
oc adm policy add-cluster-role-to-user cluster-admin admin
</code>

Next, install cockpit with SSL...run it with the proper parameters (take note of the ''https'' protocols)
<code>
oc new-project cockpit
oc project cockpit
oc process --param="COCKPIT_KUBE_URL=https://cockpit.apps.chx.cloud" \
--param="OPENSHIFT_OAUTH_PROVIDER_URL=https://ocp.chx.cloud:8443" \
--param=COCKPIT_KUBE_INSECURE="false" \
-f https://raw.githubusercontent.com/cockpit-project/cockpit/master/containers/openshift-cockpit.template | oc create -f -
</code>

Then make sure the route is ''passthrough'' with redirect

<code>
oc create route passthrough --service=openshift-cockpit --hostname=cockpit.apps.chx.cloud --port=9090 --insecure-policy=Redirect openshift-cockpit
</code>

===== External Registries =====
Edit the buildConfig to look like

<code>
output:
    to:
      kind: DockerImage   
      name: docker.io/veermuchandi/mytime:latest
    pushSecret:
      name: dockerhub
</code>

===== Heketi Notes =====

I installed ''heketi-cli'' from my fedora box

<code>
dnf -y install heketi-client
</code>

On OpenShift I grabbed the following info

__Hostname__
<code>
oc get routes -n glusterfs -o jsonpath='{.items[*].spec.host}{"\n"}'
</code>

__Token__
<code>
oc get secret heketi-storage-admin-secret -n glusterfs  -o jsonpath='{.data.key}' | base64 -d
</code>

__Username__

The default is ''admin''

Now export these
<code>
export HEKETI_CLI_SERVER=http://heketi-storage-glusterfs.apps.172.16.1.10.nip.io
export HEKETI_CLI_USER=admin
export HEKETI_CLI_KEY="kiCN5liH2NlENiB3VVZC5xyzfYEkJoRJCW3TZtbDjJY$"
</code>

You should be able to administer now
<code>
heketi-cli volume list
Id:4929364e921514486f147380d70d8119    Cluster:ef045a0b9a13c955a717ab4d6b4e1e3b    Name:heketidbstorage
Id:a533436be2ced2b46f2d48238c7b46f3    Cluster:ef045a0b9a13c955a717ab4d6b4e1e3b    Name:glusterfs-registry-volume
Id:a705b4e18c4a0d82f0223f8a994dd0f4    Cluster:ef045a0b9a13c955a717ab4d6b4e1e3b    Name:vol_a705b4e18c4a0d82f0223f8a994dd0f4
</code>

I expanded a volume using:
<code>
heketi-cli volume expand --volume=a533436be2ced2b46f2d48238c7b46f3 --expand-size=5
</code>

The ''--expand-size'' is how much you want to ADD to the existing storage. For example; if the volume was 10GB and you passwd ''--expand-size=5'', it'll now be 15GB. 
