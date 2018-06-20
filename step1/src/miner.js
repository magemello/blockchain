'use strict';

import Block from './block.js';
import Transaction from './transaction.js';

class Miner {

    constructor(difficultyLevel, ledger, address) {
        this.difficultyLevel = difficultyLevel;
        this.ledger = ledger;
        this.address = address;

        this.pendingTransactions = [];
        this.proposedBlocks = [];

        // console.debug('New Blockchain', JSON.stringify(this));
    }

    addTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    mine() {
        console.log('....Mining....');

        let newBlock = new Block(this.pendingTransactions, this.ledger.lastBlock().hash);
        let hash = newBlock.generateNewHash();
        while (hash.substring(0, this.difficultyLevel) !== Array(this.difficultyLevel + 1).join("0")) {
            hash = newBlock.generateNewHash();
        }

        const reward = this.ledger.addBlock(newBlock);
        this.pendingTransactions = [new Transaction('mining-system-coinbase-transaction', this.address, reward)];

        console.log('....Mining Done....');

        return newBlock;
    }
};

export {Miner as default};