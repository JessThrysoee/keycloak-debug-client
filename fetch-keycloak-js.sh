#!/bin/bash

echo "download latest keycloak.js from https://github.com/keycloak/keycloak-js"

curl -sSL https://api.github.com/repos/keycloak/keycloak-js/releases/latest \
  | jq -r '.assets[] | select(.content_type=="application/x-gtar") | .url' \
  | xargs curl -sSL -H "Accept: application/octet-stream" \
  | tar -zxO package/lib/keycloak.js > keycloak.js

