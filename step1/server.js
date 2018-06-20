'use strict';

import Transaction from './src/transaction.js';
import Block from './src/block.js';
import Ledger from './src/ledger.js';

const ADDRESS1 = "address1";
const ADDRESS2 = "address2";

console.log('Transaction', new Transaction(ADDRESS1, ADDRESS2, 1000))

const block = new Block([
    new Transaction(ADDRESS1, ADDRESS2, 1000),
    new Transaction(ADDRESS2, ADDRESS1, 2000),
]);

console.log('Block', block);

console.log('Hash', block.generateNewHash());

const ledger = new Ledger();

console.log('Is a valid ledger?', ledger.isValid());

const validBlock = new Block([
    new Transaction(ADDRESS1, ADDRESS2, 1000),
    new Transaction(ADDRESS2, ADDRESS1, 2000),
], ledger.lastBlock().hash);

validBlock.generateNewHash()

ledger.addBlock(validBlock);

console.log('Ledger', ledger);

console.log('Is still a valid ledger?', ledger.isValid());