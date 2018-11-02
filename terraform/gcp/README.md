```sh
gcloud auth login
gcloud iam service-accounts list
gcloud iam service-accounts keys create auth.json --iam-account dummy@developer.gserviceaccount.com
```

```tf
provider "google" {
  credentials = "${file("auth.json")}"
  project     = "dummy-191120"
}

resource "google_dns_record_set" "frontend" {
  name = "prod.run9.io."
  type = "A"
  ttl  = 60

  managed_zone = "run9-dns"

  rrdatas = ["52.220.174.185"]
}
```
