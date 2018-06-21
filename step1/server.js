'use strict';

import Transaction from './src/transaction.js';

const ADDRESS1 = "address1";
const ADDRESS2 = "address2";

console.log('Transaction', new Transaction(ADDRESS1, ADDRESS2, 1000));