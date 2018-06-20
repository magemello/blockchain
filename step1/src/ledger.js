'use strict';

import Block from './block.js';
import SHA256 from 'crypto-js/sha256';

class Ledger {

    constructor(amountReward) {
        this.chain = [];
        this.amountReward = amountReward;

        this.onInit();
        // console.debug('New Ledger', JSON.stringify(this));
    }

    onInit() {
        this.syncLedger();
    }

    syncLedger() {
        this.createGenesisBlock();
    }

    createGenesisBlock() {
        this.chain = [new Block([{}], 'GENESIS', '00058a9c76d44f6b166b9a55695ddeaf7873d003923ebe95c208d5f56683b693', 2367, '1529269254389',)];
    }

    lastBlock() {
        return this.chain[this.chain.length - 1];
    }

    getChain() {
        return this.chain;
    }

    isValid() {
        for (let i = 0; i < this.chain.length; i++) {

            const currentBlock = this.chain[i];

            if (i > 0) {
                const previousBlock = this.chain[i - 1];
                if (currentBlock.previousHash !== previousBlock.hash) {
                    return false;
                }
            }

            if (currentBlock.hash !== this.validateHash(currentBlock)) {
                return false;
            }
        }

        return true;
    }

    validateHash(block) {
        return SHA256(block.previousHash + block.timestamp + JSON.stringify(block.data) + block.nonce).toString();
    }

    addBlock(block) {
        this.chain.push(block);
        return this.amountReward;
    }
};

export {Ledger as default};