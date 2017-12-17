# Get Token
```sh
export TKN=$(curl -X POST 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token' \
 -H "Content-Type: application/x-www-form-urlencoded" \
 -d "username=keycloak" \
 -d 'password=testuser' \
 -d 'grant_type=password' \
 -d 'client_id=admin-cli' | jq -r '.access_token')
```

# Create Role
```sh
curl --request POST \
  --url http://localhost:8080/auth/admin/realms/master/roles \
  -H "Authorization: Bearer $TKN" \
  -H 'content-type: application/json' \
  --data '{
	"name":"custom"
}'
```

# List Role
```sh
curl --request GET \
  --url http://localhost:8080/auth/admin/realms/master/roles/custom \
  -H "Authorization: Bearer $TKN" \
  -H 'content-type: application/json' 
```

# Create user
```sh
curl --request POST \
  --url http://localhost:8080/auth/admin/realms/master/users \
  -H "Authorization: Bearer $TKN" \
  -H 'content-type: application/json' \
  --data '{
"username":"chakra3",
"credentials": [{
	"temporary":"false",
	"type":"password",
	"value":"password"	
}],"realmRoles": [ "user", "offline_access"], "clientRoles": {"account": ["manage-account"]} 
}'
```

# List User
```sh
curl --request GET \
  --url http://localhost:8080/auth/admin/realms/master/users?username=chakra \
  -H "Authorization: Bearer $TKN" \
  -H 'content-type: application/json' 
```

#  Add custom role to user
```sh
curl --request POST \
  --url http://localhost:8080/auth/admin/realms/master/users/9a988b01-5cdb-4fc9-becf-3c95606b50aa/role-mappings/realm \
  -H "Authorization: Bearer $TKN" \
  -H 'content-type: application/json' \
  --data '[
  {
"name": "custom",
"id":"a207a935-3fb3-4e83-a457-43733d68ac91"
  }
]'
```

# Add new client  
```sh
curl --request POST \
  --url http://localhost:8080/auth/admin/realms/master/clients \
  -H "Authorization: Bearer $TKN" \
  -H 'content-type: application/json' \
  --data '{
	"clientId":"products-app3",
	"redirectUris": ["http://localhost:8081/*"],
	"enabled":"true",
	"directAccessGrantsEnabled":"true",
	"standardFlowEnabled":"true"
}'
```










