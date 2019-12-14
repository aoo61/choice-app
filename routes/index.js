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

app.post('/send', (req, res) => {
  const output = `
    <p>Bir iletişim isteğiniz var.</p>
    <h3>İletişim Detayları</h3>
    <ul>  
      <li>Ad: ${req.body.name}</li>
      <li>Soyad: ${req.body.surname}</li>
      <li>E-mail: ${req.body.email}</li>
      <li>Tel: ${req.body.phone}</li>
      <li>Konu: ${req.body.subject}</li>
    </ul>
    <h3>Mesaj</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'a.osman.ozoglu@gmail.com', // generated ethereal user
      pass: 'ahmetefe321.'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Seçim Benim İletişim" <a.osman.ozoglu@gmail.com>', // sender address
    to: 'g140910030@sakarya.edu.tr, ali.tunali@ogr.sakarya.edu.tr, bilal.nisanci@ogr.sakarya.edu.tr', // list of receivers
    subject: req.body.subject, // Subject line
    text: 'Hello world?', // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.redirect('/contact');
  });
});

app.get('/block-explorer', (req, res, next) => {
  res.render('block-explorer', { root: __dirname });
});

module.exports = app;
