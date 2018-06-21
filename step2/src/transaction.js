'use strict';

class Transaction {

    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.timestamp = Date.now();
        //we don't cover signature in this example
        this.signature = '';
        // console.debug('New Transaction', JSON.stringify(this));
    }
};

export {Transaction as default};