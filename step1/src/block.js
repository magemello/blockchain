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
};

export {Block as default};
