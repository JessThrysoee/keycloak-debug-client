#!/bin/bash

PORT=${1:-2000}

python3 -m http.server $PORT

