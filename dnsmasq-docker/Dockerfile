```
FROM alpine:3.5
LABEL maintainer "chak.dev"
RUN apk --no-cache add dnsmasq
ADD dnsmasq.conf /etc/dnsmasq.conf
VOLUME /etc/dnsmasq
EXPOSE 53 53/udp
ENTRYPOINT ["dnsmasq", "-d"]
```
