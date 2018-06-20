#!/usr/bin/env bash
sudo ifconfig lo0 alias 127.0.0.10 up

cd ..
npm run websocket