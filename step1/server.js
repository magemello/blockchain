'use strict';

import Transaction from './src/transaction.js';
import Block from './src/block.js';

const ADDRESS1 = "address1";
const ADDRESS2 = "address2";

console.log('Transaction', new Transaction(ADDRESS1, ADDRESS2, 1000))

const block = new Block([
    new Transaction(ADDRESS1, ADDRESS2, 1000),
    new Transaction(ADDRESS2, ADDRESS1, 2000),
]);

console.log('Block', block);

console.log('Hash', block.generateNewHash());