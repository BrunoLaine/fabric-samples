'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Hyperledger Fabric Sample Query Program
 */

var hfc = require('fabric-client');
var path = require('path');

// print process.argv
var argumentsToPass = []
var functionToCall = ''
var peerNo = 0
process.argv.forEach(function (val, index, array) {
    if(index === 2) {
        peerNo = val
    }
    if(index === 3) {
        functionToCall = val
    }
    else if (index >= 4) {
        argumentsToPass.push(val)
    }
});

if (peerNo == 0){
    console.log("portNo ", portNo)
    var portNo = '7051'
} else if (peerNo == 1){
    console.log("portNo ", portNo)
    var portNo = '8051'
} else if (peerNo == 2){
    console.log("portNo ", portNo)
    var portNo = '9051'
} else if (peerNo == 3){
    console.log("portNo ", portNo)
    var portNo = '10051'
}  

console.log("portNo ", portNo)

var options = {
    wallet_path: path.join(__dirname, './creds'),
    user_id: 'PeerAdmin',
    channel_id: 'mychannel',
    chaincode_id: 'mycc',
    network_url: 'grpc://localhost:' + portNo
};

console.log("Network_url ", options.network_url)

var channel = {};
var client = null;

Promise.resolve().then(() => {
    console.log("Create a client and set the wallet location");
    client = new hfc();
    return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
}).then((wallet) => {
    console.log("Set wallet path, and associate user ", options.user_id, " with application");
    client.setStateStore(wallet);
    return client.getUserContext(options.user_id, true);
}).then((user) => {
    console.log("Check user is enrolled, and set a query URL in the network");
    if (user === undefined || user.isEnrolled() === false) {
        console.error("User not defined, or not enrolled - error");
    }
    channel = client.newChannel(options.channel_id);
    channel.addPeer(client.newPeer(options.network_url));
    return;
}).then(() => {
    console.log("Make query");
    var transaction_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", transaction_id._transaction_id);

    // queryCar - requires 1 argument, ex: args: ['CAR4'],
    // queryAllCars - requires no arguments , ex: args: [''],
//    const request = {
//        chaincodeId: options.chaincode_id,
//        txId: transaction_id,
//        fcn: 'queryAllCars',
//        args: ['']
//    };
    const request = {
        chaincodeId: options.chaincode_id,
        txId: transaction_id,
        fcn: functionToCall,
        args: argumentsToPass
    };
    return channel.queryByChaincode(request);
}).then((query_responses) => {
    console.log("returned from query");
    if (!query_responses.length) {
        console.log("No payloads were returned from query");
    } else {
        console.log("Query result count = ", query_responses.length)
    }
    if (query_responses[0] instanceof Error) {
        console.error("error from query = ", query_responses[0]);
    }
    console.log("Response is ", query_responses[0].toString());
}).catch((err) => {
    console.error("Caught Error", err);
});
