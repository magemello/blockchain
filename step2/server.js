'use strict';

import Transaction from './src/transaction.js';
import Block from './src/block.js';
import Ledger from './src/ledger.js';
import Miner from './src/miner.js';
import Node from './src/node.js';
import P2p from './src/p2p.js';
import Express from 'express';

const ADDRESS2 = 'address2';

const DIFFICULTY = 2;
const REWARD = 5;
const FIRST_NODE = '127.0.0.1';
const HOST_WEB_SOCKET = 'ws://127.0.0.10:3010';

const ip = process.argv[3] || FIRST_NODE;
const port = process.argv[4] || 3001;
const publicKey = process.argv[5] || 'address1';

const app = Express();

let node = new Node(ip, port, publicKey, publicKey + 'private');
let p2p = new P2p(HOST_WEB_SOCKET, node);

initApi(app, port, ip, p2p);

console.log('Transaction', new Transaction(node.address, ADDRESS2, 1000))

const block = new Block([
    new Transaction(node.address, ADDRESS2, 1000),
    new Transaction(ADDRESS2, node.address, 2000),
]);

console.log('Block', block);

console.log('Hash', block.generateNewHash());

const ledger = new Ledger(REWARD);

console.log('Is a valid ledger?', ledger.isValid());

const validBlock = new Block([
    new Transaction(node.address, ADDRESS2, 1000),
    new Transaction(ADDRESS2, node.address, 2000),
], ledger.lastBlock().hash);

validBlock.generateNewHash()

ledger.addBlock(validBlock);

console.log('Ledger', ledger);

console.log('Is still a valid ledger?', ledger.isValid());

const miner = new Miner(DIFFICULTY, ledger, node);
miner.addTransaction(new Transaction(node.address, ADDRESS2, 50));
miner.addTransaction(new Transaction(ADDRESS2, node.address, 700));

console.log('Pending Transaction', miner.pendingTransactions);
miner.mine();
console.log('Ledger', ledger.getChain());
console.log('Pending Transaction', miner.pendingTransactions);



function initApi(app, port, ip, p2p) {
    //REST APIs
    app.use(require('body-parser').json());
    app.use((req, res, next) => {
        res.setHeader('Public-Key', publicKey);
        next();
    })
    app.listen(port, ip, () => {
    });

    app.get('/', (request, response) => {
        response.status(200).json({
            "status": "active"
        }).end();
    });

    app.post('/peers', (request, response) => {

            console.log('******************POST PEERS*******************');

            const body = request.body;

            const requestIp = body.ip;
            const requestPort = body.port;
            const requestPublicKey = body.publicKey;

            if (requestIp && requestPort && requestIp !== ip && requestPort !== port) {
                p2p.addPeer(requestIp, requestPort, requestPublicKey, false);
                p2p.discoverPeers();
            }

            const responseMessage = {
                'status': 'Peers',
                'body': {'peers': p2p.getPeers()}
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });
}