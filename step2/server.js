'use strict';

import Transaction from './src/transaction.js';
import Block from './src/block.js';
import Ledger from './src/ledger.js';
import Miner from './src/miner.js';
import Node from './src/node.js';
import P2p from './src/p2p.js';
import Express from 'express';
import Wallet from './src/wallet.js';

const DIFFICULTY = 2;
const REWARD = 5;
const FIRST_NODE = '127.0.0.1';
const HOST_WEB_SOCKET = 'ws://127.0.0.10:3010';

const ip = process.argv[3] || FIRST_NODE;
const port = process.argv[4] || 3001;
const publicKey = process.argv[5] || 'address1';

const app = Express();

const node = new Node(ip, port, publicKey, publicKey + 'private');
const p2p = new P2p(HOST_WEB_SOCKET, node);
const ledger = new Ledger(REWARD, p2p, node);
const wallet = new Wallet(p2p, node, ledger);
const miner = new Miner(DIFFICULTY, ledger, node, p2p, wallet);

initApi(app, port, ip, p2p);

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

    app.post('/wallet/transaction', (request, response) => {
            console.log('*************POST TRANSACTION******************');

            const body = request.body;
            const transaction = wallet.createTransaction(body.to, body.amount);

            const responseMessage = {
                'status': 'New transaction created',
                'body': {'transaction': transaction}
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });


    app.get('/wallet/balance', (request, response) => {

            console.log('*****************GET BALANCE*******************');

            const responseMessage = {
                'status': 'Wallet balance',
                'body': {'balance': wallet.getBalance()}
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });


    app.post('/mine', (request, response) => {

            console.log('******************POST MINE********************');

            const newBlock = miner.mine();

            const responseMessage = {
                'status': 'Block Mined',
                'body': {'block': newBlock}
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });

    app.get('/pending-transactions', (request, response) => {

            console.log('**********GET PENDING TRANSACTIONS*************');

            const responseMessage = {
                'status': 'Pending Transaction',
                'body': {'transactions': miner.pendingTransactions}
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });


    app.get('/ledger', (request, response) => {

            console.log('****************GET LEDGER*********************');

            const responseMessage = {
                'status': 'Ledger',
                'body': {'ledger': ledger.getChain()}
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });

    app.get('/ledger/validate', (request, response) => {

            console.log('*****************GET VALIDATE******************');

            const responseMessage = {
                'status': 'Validated',
                'body': {'valid': ledger.isValid()}
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });


//DEMO APIs

    app.post('/admin/propose-fake-block', (request, response) => {

            console.log('**************POST PROPOSE BLOCK**************');

            const newBlock = new Block([
                new Transaction('address2', node.address, 1000),
                new Transaction('address3', node.address, 2000),
            ], ledger.lastBlock().hash);

            let hash = newBlock.generateNewHash();
            while (hash.substring(0, DIFFICULTY) !== Array(DIFFICULTY + 1).join("0")) {
                hash = newBlock.generateNewHash();
            }

            p2p.sendMessage('proposeBlock', {
                'address': node.address,
                'block': newBlock
            });

            const responseMessage = {
                'status': 'Block Proposed',
                'block': newBlock
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });


    app.post('/admin/pollute-ledger', (request, response) => {

            console.log('**************POST POLLUTE LEDGER**************');

            ledger.getChain()[0].data = [new Transaction('address2', node.address, 1000)];

            const responseMessage = {
                'status': 'Ledger Polluted'
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });

    app.post('/admin/ico', (request, response) => {

            console.log('*******************POST ICO********************');

            const body = request.body;
            const transaction = new Transaction('system-ICO', body.to, body.amount)
            p2p.sendMessage('transaction', transaction);

            const responseMessage = {
                'status': 'New ICO',
                'body': {'transaction': transaction}
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });


    app.get("/admin/clean", function (request, response) {
        for (var i = 0; i < 25; i++)
            console.log("\n");
        response.status(200).end();
    });

    app.post('/admin/reset', (request, response) => {

            console.log('*******************POST RESET********************');

            ledger.createGenesisBlock();
            miner.pendingTransactions = [];

            const responseMessage = {
                'status': 'Ledger',
                'body': {'ledger': ledger.getChain()}
            };

            console.log(JSON.stringify(responseMessage));

            response.status(200).json(responseMessage).end();
        },
        (error) => {
            console.error(error);
        });

}