'use strict';

import rest from 'unirest';
import WebSocket from 'ws';
import Events from 'events';

class P2p {

    constructor(hostWebSocket, node) {
        this.hostWebSocket = hostWebSocket;
        this.node = node;

        this.peers = [];

        this.eventEmitter = new Events.EventEmitter();

        this.onInit();
        // console.debug('New P2p', JSON.stringify(this));
    }

    onInit(){
        this.addPeer(this.node.ip, this.node.port, this.node.publicKey, true);
        this.connectToWebSocket();
    }

    connectToWebSocket() {
        this.webSocket = new WebSocket(this.hostWebSocket);

        this.webSocket.onopen = () => {
            console.log('Connected to webSocket');
            this.sendMessage('whoiam', {
                'ip': this.node.ip,
                'port': this.node.port,
                'publicKey': this.node.publicKey
            });
        };

        this.webSocket.onerror = (error) => {
            console.error('WebSocket Error ' + error);
        };

        this.webSocket.onmessage = (data) => {
            this.eventEmitter.emit('onmessage', data);
            const message = JSON.parse(data.data);
            if (message.type === 'whoiam') {
                this.addPeer(message.body.ip, message.body.port, message.body.publicKey, false);
            }
            this.discoverPeers();
        };
    }

    getEvents() {
        return this.eventEmitter;
    }

    sendMessage(type, body) {
        let message = {
            'type': type,
            'body': body
        };
        this.webSocket.send(JSON.stringify(message));
    }

    addPeer(ip, port, publicKey, discovered) {
        if (this.isANewPeer(ip, port)) {
            this.peers.push({
                'ip': ip,
                'port': port,
                'publicKey': publicKey,
                'discovered': discovered || false
            })
        } else {
            this.peers.forEach((peer) => {
                if (peer.ip === ip && peer.port === port) {
                    peer.discovered = true;
                }
            });
        }
    }

    isANewPeer(ip, port) {
        const findPeer = this.peers.filter(peer => peer.port === port && peer.ip === ip);
        if (findPeer.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    getPeers() {
        return this.peers;
    }

    discoverPeers() {
        this.peers.forEach((peer) => {
            if (!peer.discovered) {
                this.requestPeers(peer.ip, peer.port);
            }
        });
    }

    requestPeers(ip, port) {
        console.log('Discovering peer', 'http://' + ip + ':' + port);
        rest.post('http://' + ip + ':' + port + '/peers')
            .json({
                'ip': this.node.ip,
                'port': this.node.port,
                'publicKey': this.node.publicKey
            })
            .end((data) => {
                if (data && data.body) {
                    const peers = data.body.body.peers;
                    peers.forEach((peer) => {
                        if (peer.ip) {
                            if (peer.ip === ip && peer.port === port) {
                                this.addPeer(peer.ip, peer.port, peer.publicKey, true);
                            } else {
                                this.addPeer(peer.ip, peer.port, peer.publicKey, false);
                            }
                        }
                    });
                }
                this.eventEmitter.emit('discover', 'http://' + ip + ':' + port);
                this.discoverPeers();
            });
    }
};

export {P2p as default};