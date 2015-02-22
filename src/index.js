var Explorer = require('webrtc-explorer');
var Id = require('dht-id');

exports = module.exports;

var peer;
var peerId;
var toSuccessorId;

exports.participate = function(options) {
    //connect to the network
    var config = {
        signalingURL: 'http://localhost:9000',
    };

    peer = new Explorer(config);

    peer.events.on('registered', function(data) {
        console.log('Id:', data.peerId);
        peerId = data.peerId;
        toSuccessorId = new Id(new Id(peerId).toDec() + 1).toHex();
    });

    peer.events.on('message', function(envelope) {
        if (envelope.data === undefined) {
            return console.log('..');
        } 
        
        if(envelope.data.type === 'task') {
            // execute task 

        }

        if(envelope.data.type === 'gossip') {
            console.log('gossip: ', envelope); 
            
            envelope.data.peersIdAvailable.push(peerId);
            
            if (envelope.data.peersIdAvailable.length === 
                    envelope.data.need) {
                peer.send(envelope.data.srcId, {
                    peersIdAvailable: envelope.data.peersIdAvailable,
                    type: 'gossip-result'
                });
                return;
            } else {
                peer.send(toSuccessorId, envelope.data); 
            }

        }


    });

    peer.register();
};

exports.execute = function(jobData, task, nPeers, done) {

    // prepare the job
    var taskString = task.toString();
    var jobResult = [];

    peer.events.on('message', function(envelope) {
        if (envelope.data.type === 'gossip-result') {
            console.log('gossip-result', envelope);
            sendTasks(envelope.data.peersIdAvailable); 
        }
        if (envelope.data.type === 'task-result') {
            console.log('task-result');
            jobResult.push(envelope.data.result);
            if (jobResult.length === jobData.length) {
                done(jobResult);
            }
        }
    });

    function sendTasks(peersIdAvailable) {
        console.log('send tasks now');
        console.log(peersIdAvailable);
    }
    
    peer.send(toSuccessorId, {
        type: 'gossip',
        peersIdAvailable: [],
        need: nPeers,
        srcId: peerId
    });
    
};
