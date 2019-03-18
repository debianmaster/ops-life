> source stackoverflow

To view open ports, use the following command.

`firewall-cmd --list-ports`
We use the following to see services whose ports are open.

`firewall-cmd --list-services`
We use the following to see services whose ports are open and see open ports

`firewall-cmd --list-all`
To add a service to the firewall, we use the following command, in which case the service will use any port to open in the firewall.

`firewall-cmd --add-services=ntp `
For this service to be permanently open we use the following command.

`firewall-cmd —add-service=ntp --permanent `
To add a port, use the following command

`firewall-cmd --add-port=132/tcp  --permanent`
To run the firewall must be reloaded using the following command.

`firewall-cmd --reload`
