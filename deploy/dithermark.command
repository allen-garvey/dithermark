#!/bin/sh

PORT=8800
HTML_ROOT="$(dirname "$0")/public_html"

if [ -x "$(command -v python3)" ]; then
    python3 -m http.server $PORT -d $HTML_ROOT
elif [ -x "$(command -v php)" ]; then
    php -S "localhost:$PORT" -t $HTML_ROOT
else
    >&2 echo "python3 or php is required to run $(basename "$0")"
    return 1;
fi