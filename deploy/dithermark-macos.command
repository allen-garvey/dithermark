#!/bin/sh
python3 -m http.server 8080 -d "$(dirname "$0")/public_html"