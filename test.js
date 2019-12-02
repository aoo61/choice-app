const Blockchain = require('./models/Blockchain');

const myBlockchain = new Blockchain();

myBlockchain.createNewBlock(1001, '0SADASFSD19FDG', '87DSADIEWF3DSF');

console.log(myBlockchain);