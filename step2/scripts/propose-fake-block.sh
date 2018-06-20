#!/usr/bin/env bash

port=3001
if [ -n "$1" ]
  then
    port=$1
fi

iden=$(echo $port-3000 | bc)
curl -X POST http://127.0.0.$iden:$port/admin/propose-fake-block
echo -e "\n"