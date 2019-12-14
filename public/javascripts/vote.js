const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('../Models/Blockchain');

const myBlockchain = new Blockchain();

// selectors
const poll = document.getElementById('pollButtons');
const pollBtns = poll.querySelectorAll('li');

// assigning initial values
let data = [];
for(let i=0; i<pollBtns.length; i++) {
    let r = Math.floor(Math.random() * 50);
    data.push(r);
}

[].forEach.call(pollBtns, (pollBtn) => {
    pollBtn.addEventListener('click', showResult);
});

function showResult() {
    let t = 0;
    for(let i=0; i<data.length; i++) {
        t += data[i];
    }
    let perc = data.map(j => Math.round(j*100/t));

    [].forEach.call(pollBtns, (pollBtn, i) => {
        //let bg = `linear-gradient(90deg, #f25757 ${perc[i]}%, transparent ${perc[i]}%)`;
        //pollBtn.style.backgroundImage = bg;

        pollBtn.removeEventListener('click', showResult);
    });
}


