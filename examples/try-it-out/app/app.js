var browserProcess = require('./../../../src/index.js');


var config = {
    signalingURL: 'http://localhost:9000',
    logging: true
};

browserProcess.participate(config);

start = function() {
    var data = [0,1,2,3,4,5,6,7,8,9,10];
    var task = function(a) {return a+1;};
    var nPeers = 2;
    
    browserProcess.execute(data, task, nPeers, function done(){
        
    });
};
