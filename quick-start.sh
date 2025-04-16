#!/bin/bash -e

# create realm 'keycloak-debug' with client 'keycloak-debug-client' and user 'testuser'

REALM="keycloak-debug"
CLIENT="keycloak-debug-client"
USERNAME="testuser"
PASSWORD="testuser1"

#---

if [[ -z $KEYCLOAK_HOME ]]; then
    echo "set the KEYCLOAK_HOME environment variable" >&2
    exit 1
fi

if [[ ! -f config.json ]]; then
    cat > config.json <<EOF
{
  "url": "http://localhost:8080",
  "realm": "$REALM",
  "clientId": "$CLIENT"
}
EOF
fi

if [[ ! -f keycloak.js ]]; then
    ./fetch-keycloak-js.sh
fi


kcadm() {
    "$KEYCLOAK_HOME/bin/kcadm.sh" "$@"
}

kcadm config credentials --server http://localhost:8080 --realm master --user admin

kcadm create realms -s realm="$REALM" -s enabled=true
kcadm create clients -r "$REALM" -s clientId="$CLIENT" -s enabled=true -s 'redirectUris=["http://localhost:2000/*"]' -s publicClient=true

kcadm create users -r "$REALM" -s username=testuser -s email="$USERNAME@example.com" -s firstName="$USERNAME" -s lastName="$USERNAME" -s enabled=true
kcadm set-password -r "$REALM" --username "$USERNAME" --new-password "$PASSWORD"


