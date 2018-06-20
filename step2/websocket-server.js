'use strict';

import WebSocket from 'ws';

const ip = process.argv[3] || '127.0.0.10';
const port = process.argv[4] || 3010;

const webSocket = new WebSocket.Server({
    port: port,
    host: ip
});

webSocket.on('connection', (connection) => {

    connection.on('message', (msg) => {
        console.log(msg);
        webSocket.clients.forEach(function each(client) {
            if (client !== webSocket && client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    });

    connection.on('close', () => {
        console.log('closing connection');
    });
});