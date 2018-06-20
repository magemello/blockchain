'use strict';

import Transaction from './transaction.js';

class Wallet {

    constructor(p2p, node, ledger) {
        this.p2p = p2p;
        this.node = node;
        this.ledger = ledger;

        // console.debug('New Wallet', JSON.stringify(this));
    }

    createTransaction(to, value) {
        let transaction = new Transaction(this.node.address, to, value)
        this.p2p.sendMessage('transaction', transaction);

        console.log('Create New transaction', transaction);
        return transaction;
    }

    getBalance(address = this.node.address) {
        let balance = 0;

        for (const block of this.ledger.getChain()) {
            for (const transaction of block.data) {
                if (transaction.from === address) {
                    balance -= transaction.amount;
                }

                if (transaction.to === address) {
                    balance += transaction.amount;
                }
            }
        }

        return balance;
    }
};

export {Wallet as default};