'use strict';

import Transaction from './transaction.js';
import Block from './block.js';
import SHA256 from 'crypto-js/sha256';
import rest from 'unirest';

class Ledger {

    constructor(amountReward, p2p, node) {
        this.chain = [];
        this.rewardAssigned = [];

        this.amountReward = amountReward;
        this.p2p = p2p;
        this.node = node;

        this.onInit();
        // console.debug('New Ledger', JSON.stringify(this));
    }

    onInit() {
        this.createGenesisBlock();
        this.syncLedger();
    }

    createGenesisBlock() {
        this.chain = [new Block([{}], 'GENESIS', '00058a9c76d44f6b166b9a55695ddeaf7873d003923ebe95c208d5f56683b693', 2367, '1529269254389',)];
    }

    syncLedger() {
        console.log('Updating Ledger...');
        let isLedgerSynced = false;
        this.p2p.getEvents().on('discover', (host) => {
            if (this.isEmpty()) {
                if (!isLedgerSynced) {
                    rest.get(host + '/ledger').end((data) => {
                        if (data && data.body) {
                            const ledger = data.body.body;
                            this.chain = ledger.ledger;
                        }
                    });
                    console.log('Ledger Updated.');

                    isLedgerSynced = true;
                }
            }
        });
    }

    isEmpty() {
        return this.chain.length === 0;
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

    addBlock(block, address) {
        this.chain.push(block);
        this.createReward(address, block.hash);
    }

    createReward(address, hash) {
        //silly control to avoid to send multiple rewards
        if (address === this.node.address && this.rewardAssigned.indexOf(hash) === -1) {
            console.log('....Rewarding....');
            const rewardTransaction = new Transaction('mining-system-coinbase-transaction', address, this.amountReward);
            this.p2p.sendMessage('transaction', rewardTransaction);
            this.rewardAssigned.push(hash);
        }
    }
};

export {Ledger as default};