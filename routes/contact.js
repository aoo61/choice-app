const express = require('express');
const app = express();
const nodemailer = require('nodemailer');

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

module.exports = app;