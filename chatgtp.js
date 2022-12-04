const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// Create a Nodemailer transport
let transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@example.com',
        pass: 'password'
    }
});

app.use(express.json());

app.post('/send-message', function (req, res) {
    // Get the form data
    let name = req.body.name;
    let email = req.body.email;
    let message = req.body.message;

    // Set the recipient email address
    let to = 'info@example.com';

    // Set the email subject
    let subject = 'New Message from Contact Form';

    // Build the email content
    let email_content = `Name: ${name}\n`;
    email_content += `Email: ${email}\n\n`;
    email_content += `Message:\n${message}\n`;

    // Set the email headers
    let headers = `From: ${name} <${email}>`;

    // Send the email
    transporter.sendMail({ to, subject, text: email_content, headers }, function (err, info) {
