#!/bin/bash

if [[ $(python --version 2>&1) == Python\ 2* ]]
then
  python -m SimpleHTTPServer 2000
else
  python -m http.server 2000
fi

