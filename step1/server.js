'use strict';

import Transaction from './src/transaction.js';
import Block from './src/block.js';
import Ledger from './src/ledger.js';
import Miner from './src/miner.js';

const ADDRESS1 = "address1";
const ADDRESS2 = "address2";
const DIFFICULTY = 2;
const REWARD = 5;

console.log('Transaction', new Transaction(ADDRESS1, ADDRESS2, 1000))

const block = new Block([
    new Transaction(ADDRESS1, ADDRESS2, 1000),
    new Transaction(ADDRESS2, ADDRESS1, 2000),
]);

console.log('Block', block);

console.log('Hash', block.generateNewHash());

const ledger = new Ledger(REWARD);

console.log('Is a valid ledger?', ledger.isValid());

const validBlock = new Block([
    new Transaction(ADDRESS1, ADDRESS2, 1000),
    new Transaction(ADDRESS2, ADDRESS1, 2000),
], ledger.lastBlock().hash);

validBlock.generateNewHash()

ledger.addBlock(validBlock);

console.log('Ledger', ledger);

console.log('Is still a valid ledger?', ledger.isValid());

const miner = new Miner(DIFFICULTY, ledger, ADDRESS1);
miner.addTransaction(new Transaction(ADDRESS1, ADDRESS2, 50));
miner.addTransaction(new Transaction(ADDRESS2, ADDRESS1, 700));

console.log('Pending Transaction', miner.pendingTransactions);
miner.mine();
console.log('Ledger', ledger.getChain());
console.log('Pending Transaction', miner.pendingTransactions);
