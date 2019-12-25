const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('../Models/Blockchain');
const uuid = require('uuid/v1');
const rp = require('request-promise');

const myBlockchain = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Blockchain i gösterme
app.get('/show', (req, res) => {
    res.send(myBlockchain);
});

// Transaction oluşturma
app.post('/transaction', (req, res) => {
    const newTransaction = req.body;
    myBlockchain.addTransactionToPendingTransactions(newTransaction);
    res.json({note: `Bloğa eklemek için transaction oluşturuldu.`});
});

//Oluşturulan transaction ı broadcast te yayınlama
app.post('/transaction/broadcast', (req, res) => {
    const newTransaction = myBlockchain.createNewTransaction(req.body.choice);
    myBlockchain.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = [];
    myBlockchain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
        .then(data => {
            res.redirect('/vote');
        });
});

// Oluşturulan block u mining yapma
app.get('/mine', (req, res) => {
    const lastBlock = myBlockchain.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transaction: myBlockchain.pendingTransactions,
        index: lastBlock['index'] + 1
    };
    const nonce = myBlockchain.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = myBlockchain.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = myBlockchain.createNewBlock(nonce, previousBlockHash, blockHash);

    const requestPromises = [];
    myBlockchain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain/yeni-block-onayi',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
        .then(data => {
            res.render('mine', {
                note: "Yeni block oluşturuldu ve broadcast de yayınlandı.",
                block: newBlock
            });
        });
});

// Yeni block u onaylama
app.post('/yeni-block-onayi', (req, res) => {
    const newBlock = req.body.newBlock;
    const lastBlock = myBlockchain.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    if(correctHash && correctIndex){
        myBlockchain.chain.push(newBlock);
        myBlockchain.pendingTransactions = [];
        res.json({
            note: 'Yeni block kabul edildi ve onaylandı.',
            newBlock: newBlock
        });
    } else{
        res.json({
            note: 'Yeni block reddedildi.',
            newBlock: newBlock
        });
    }
});

// Kayıt edilen node u broadcast e yayınlama
app.post('/node-broadcast-yayinlama', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    if (myBlockchain.networkNodes.indexOf(newNodeUrl) == -1)
        myBlockchain.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    myBlockchain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain/node-kayit',
            method: 'POST',
            body: { newNodeUrl : newNodeUrl },
            json: true
        };
        regNodesPromises.push(rp(requestOptions));
    });

    Promise.all(regNodesPromises)
        .then(data => {
            const bulkRegisterOptions = {
                uri: newNodeUrl + '/blockchain/coklu-node-kaydi',
                method: 'POST',
                body: { allNetworkNodes: [...myBlockchain.networkNodes, myBlockchain.currentNodeUrl]},
                json: true
            };
            return rp(bulkRegisterOptions);
        })
        .then(data => {
            const consensus = {
                uri: newNodeUrl + '/blockchain/consensus',
                method: 'GET',
                json: true
            };
            return rp(consensus);
        });
    res.redirect('node');
});

// Node kayıt etme
app.post('/node-kayit', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = myBlockchain.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = myBlockchain.currentNodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode)
        myBlockchain.networkNodes.push(newNodeUrl);
    res.json({ note: 'Yeni node başarıyla kayıt edildi.'});
});

// Aynı anda çoklu node kaydetme
app.post('/coklu-node-kaydi', (req, res) => {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = myBlockchain.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = myBlockchain.currentNodeUrl !== networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode)
            myBlockchain.networkNodes.push(networkNodeUrl);
    });
    res.json({ note: 'Çoklu node kaydı başarılı oldu.'});
});

// Blockchain in içindeki chain i yeni kayıt edilen node da yerine koyma.
app.get('/consensus', (req, res) => {
    const requestPromises =  [];
    myBlockchain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain/show',
            method: 'GET',
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
        .then(blockchains => {
            const currentChainLength = myBlockchain.chain.length;
            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = null;

            blockchains.forEach(blockchain => {
                if(blockchain.chain.length > maxChainLength) {
                    maxChainLength = blockchain.chain.length;
                    newLongestChain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
                }
            });
            if (!newLongestChain || (newLongestChain && !myBlockchain.chainIsValid(newLongestChain))) {
                res.json({
                    note: 'Mevcut zincir yerine koyulamadı.',
                    chain: myBlockchain.chain
                });
            } else {
                myBlockchain.chain = newLongestChain;
                myBlockchain.pendingTransactions = newPendingTransactions;
                res.json({
                    note: 'Zincir yerine konuldu.',
                    chain: myBlockchain.chain
                });
            }
        });
});

app.get('/block/:blockHash', (req, res) => {
    const blockHash = req.params.blockHash;
    const correctBlock = myBlockchain.getBlock(blockHash);
    res.json({
        block: correctBlock
    });
});

app.get('/mineBlock', (req, res) => {
    let mineBlock = null;
    myBlockchain.chain.forEach(block => {
        if(block.index === myBlockchain.getLastBlock()['index'])
            mineBlock = block;
    });
    res.json({ block: mineBlock});
});

app.get('/transaction/:transactionId', (req, res) => {
    const transactionId = req.params.transactionId;
    const transactionData = myBlockchain.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    });
});

app.get('/node', (req, res, next) => {
    res.render('node');
});

app.get('/result', (req, res, next) => {
    let choice = myBlockchain.getResults();
    let choiceA = 0;
    let choiceB = 0;
    let choiceC = 0;
    let choiceD = 0;
    choice.choice.forEach(data => {
        if(data === 'A')
            choiceA++;
        else if(data === 'B')
            choiceB++;
        else if(data === 'C')
            choiceC++;
        else
            choiceD++;
    });
    res.send({
        vote: choice.vote,
        choiceA: choiceA,
        choiceB: choiceB,
        choiceC: choiceC,
        choiceD: choiceD
    });
});

app.get('/search', (req, res, next) => {
    res.render('search');
});

app.get('/test', (req, res, next) => {
    res.render('test');
});

module.exports = app;