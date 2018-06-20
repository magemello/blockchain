'use strict';

import SHA256 from 'crypto-js/sha256';

class Block {

    constructor(data, previousHash = '', hash = '', nonce = 0, timestamp = Date.now()) {
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.hash = hash;

        // console.debug('New Block', JSON.stringify(this));
    }

    generateNewHash() {
        this.nonce++;
        this.hash = SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
        return this.hash;
    }
};

export {Block as default};
