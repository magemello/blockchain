#!/usr/bin/env bash

port=3001
if [ -n "$1" ]
  then
    port=$1
fi

to="address2"
if [ -n "$2" ]
  then
    to=$2
fi

amount=20
if [ -n "$3" ]
  then
    amount=$3
fi

iden=$(echo $port-3000 | bc)
curl -v -H 'Content-Type: application/json' -X POST -d '{"to": "'$to'","amount": '$amount'}' http://127.0.0.$iden:$port/transaction
echo -e "\n"