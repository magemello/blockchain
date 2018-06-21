#!/usr/bin/env bash

sudo ifconfig lo0 alias 127.0.0.2 up
sudo ifconfig lo0 alias 127.0.0.3 up
sudo ifconfig lo0 alias 127.0.0.4 up
sudo ifconfig lo0 alias 127.0.0.5 up
sudo ifconfig lo0 alias 127.0.0.6 up
sudo ifconfig lo0 alias 127.0.0.7 up
sudo ifconfig lo0 alias 127.0.0.8 up
sudo ifconfig lo0 alias 127.0.0.9 up

if [ -z "$1" ]
  then
    echo "No port specified"
    exit 1
fi

iden=$(echo $1-3000 | bc)
echo Going to start 127.0.0.$iden:$1

cd ..
npm run node$iden