const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Blockchain = require('../Models/Blockchain');
const User = require('../models/User');

app.get('/', (req, res, next) => {
  res.render('index');
});

app.get('/index', (req, res, next) => {
  res.render('index');
});

app.get('/about', (req, res, next) => {
  res.render('about');
});

app.get('/vote', (req, res, next) => {
  res.render('vote');
});

app.get('/contact', (req, res, next) => {
  res.render('contact');
});

app.get('/blockchain', (req, res, next) => {
  res.render('blockchain');
});

app.post('/register', (req, res) => {
  const {username, password } = req.body;
  bcrypt.hash(password, 10).then(hash => {
    const user = new User ({
      username,
      password: hash
    });

    const promise = user.save();
    promise.then(data => {
      res.json(data);
    }).catch(err => {
      res.json(err);
    });
  });
});

app.post('/authenticate', (req, res) => {
  const {username, password} = req.body;
  User.findOne({
    username
  }, (err, user) => {
    if(err)
      throw err;
    if(!user){
      res.json({
        status: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }else {
      bcrypt.compare(password, user.password).then(result => {
        if(!result){
          res.json({
            status: false,
            message: 'Şifre yanlış'
          });
        }else {
          const payload = {
            username
          };
          const token = jwt.sign(payload, req.app.get('api_secret_key'), {
            expiresIn: 1440
          });
          res.json({
            status: true,
            token
          });
        }
      });
    }
  });
});
/*
app.get('/block-explorer', (req, res, next) => {
  res.render('block-explorer', { root: __dirname });
});*/

module.exports = app;
