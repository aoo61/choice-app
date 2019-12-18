const express = require('express');
const app = express();

app.get('/', (req, res, next) => {
  res.render('index');
});

app.get('/index', (req, res, next) => {
  res.render('index');
});

app.get('/vote', (req, res, next) => {
  res.render('vote');
});

app.get('/results', (req, res, next) => {
  res.render('results');
});

app.get('/blockchain', (req, res, next) => {
  res.render('blockchain');
});

app.get('/about', (req, res, next) => {
  res.render('about');
});

app.get('/contact', (req, res, next) => {
  res.render('contact');
});

module.exports = app;