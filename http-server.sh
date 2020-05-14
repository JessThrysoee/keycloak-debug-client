#!/bin/bash

PORT=${1:-2000}

if [[ $(python --version 2>&1) == Python\ 2* ]]
then
  python -m SimpleHTTPServer $PORT
else
  python -m http.server $PORT
fi

