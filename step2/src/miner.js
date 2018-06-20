'use strict';

import Block from './block.js';
import SHA256 from 'crypto-js/sha256';

class Miner {

    constructor(difficultyLevel, ledger, node, p2p) {
        this.difficultyLevel = difficultyLevel;
        this.ledger = ledger;
        this.node = node;
        this.p2p = p2p;

        this.pendingTransactions = [];
        this.proposedBlocks = [];

        this.onInit();
        // console.debug('New Blockchain', JSON.stringify(this));
    }

    onInit() {
        this.listenOnNewTransaction();
        this.listenOnProposedBlocks();
        this.listenOnCheckConsensusNewBlocks();
    }

    listenOnCheckConsensusNewBlocks() {
        let quorum = (this.p2p.peers.length / 2) + 1;
        this.p2p.getEvents().on('onmessage', (data) => {
            const message = JSON.parse(data.data);
            if (message.type === 'validBlock') {

                const minedBlockMessage = message.body;

                let isNewProposal = true;

                for (const proposal of this.proposedBlocks) {
                    if (proposal.block.hash === minedBlockMessage.block.hash) {
                        proposal.quorum++;
                        if (proposal.quorum >= quorum) {
                            if (this.isValidBlock(minedBlockMessage.block)) {
                                this.removeMinedTransactionsFromPendingTransactions(minedBlockMessage.block.data);
                                this.ledger.addBlock(minedBlockMessage.block, minedBlockMessage.address);
                            }
                        }
                        isNewProposal = false;
                    }
                }

                if (isNewProposal) {
                    this.proposedBlocks.push({
                        'quorum': 1,
                        'block': minedBlockMessage.block,
                        'address': minedBlockMessage.address
                    });
                }
                console.log('Received Vote for Block ', minedBlockMessage.block.hash);
            }
        });
    }

    listenOnProposedBlocks() {
        this.p2p.getEvents().on('onmessage', (data) => {
            const message = JSON.parse(data.data);
            if (message.type === 'proposeBlock') {
                const proposeBlockMessage = message.body;
                if (this.isValidBlock(message.body.block)) {
                    console.log('Valid Block Proposed', proposeBlockMessage.block.hash);
                    this.p2p.sendMessage('validBlock', proposeBlockMessage);
                } else {
                    console.log('Not Valid Block Proposed', proposeBlockMessage.block.hash);
                }
            }
        });
    }

    listenOnNewTransaction() {
        this.p2p.getEvents().on('onmessage', (data) => {
            const message = JSON.parse(data.data);
            if (message.type === 'transaction') {
                //we should validate the signature of the transaction here...but we don't cover it in this example
                this.pendingTransactions.push(message.body);
            }
        });
    }

    removeMinedTransactionsFromPendingTransactions(transactions) {
        for (const transaction of transactions) {
            for (let i = 0; i < this.pendingTransactions.length; i++) {
                if (JSON.stringify(this.pendingTransactions[i]) === JSON.stringify(transaction)) {
                    this.pendingTransactions.splice(i);
                }
            }
        }
    }

    validateHash(block) {
        return SHA256(block.previousHash + block.timestamp + JSON.stringify(block.data) + block.nonce).toString();
    }

    isValidBlock(newBlock) {
        if (newBlock.hash !== this.validateHash(newBlock)) {
            return false;
        }

        if (newBlock.previousHash !== this.ledger.lastBlock().hash) {
            return false;
        }

        for (const transaction of newBlock.data) {
            if (!this.isValidTransaction(transaction)) {
                return false;
            }
        }

        return true;
    }

    isValidTransaction(transaction) {
        const isValidTransaction = this.pendingTransactions
            .filter(pending => pending.to === transaction.to
                && pending.from === transaction.from
                && pending.amount === transaction.amount);

        if (isValidTransaction.length === 0) {
            return false;
        }

        return true;
    }

    mine() {
        console.log('....Mining....');

        let newBlock = new Block(this.pendingTransactions, this.ledger.lastBlock().hash);
        let hash = newBlock.generateNewHash();
        while (hash.substring(0, this.difficultyLevel) !== Array(this.difficultyLevel + 1).join("0")) {
            hash = newBlock.generateNewHash();
        }

        console.log('....Mining Done....');

        console.log("Proposing New Block ", hash);

        this.p2p.sendMessage('proposeBlock', {
            'address': this.node.address,
            'block': newBlock
        });

        return newBlock;
    }
};

export {Miner as default};