'use strict';

class Node {

    constructor(ip, port, address, privateKey) {
        this.ip = ip;
        this.port = port;
        this.address = address;
        //we don't use the privateKey in this example
        this.privateKey = privateKey;

        // console.debug('New Node', JSON.stringify(this));
    }
};

export {Node as default};
