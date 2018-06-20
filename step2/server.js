'use strict';

import Transaction from './src/transaction.js';
import Block from './src/block.js';
import Ledger from './src/ledger.js';
import Miner from './src/miner.js';
import Node from './src/node.js';

const ADDRESS2 = 'address2';

const DIFFICULTY = 2;
const REWARD = 5;
const FIRST_NODE = '127.0.0.1';

const ip = process.argv[3] || FIRST_NODE;
const port = process.argv[4] || 3001;
const publicKey = process.argv[5] || 'address1';

let node = new Node(ip, port, publicKey, publicKey + 'private');

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
