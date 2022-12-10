import nodemailer from 'nodemailer';

// APP_KEY = proccess.env.APP_PASSWORD

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'stelioslagaras@gmail.com',
            pass: 'nzlmbdwqnacykccr',
        }
    });

    const mailOptions = {
        from: 'stelioslagaras@gmail.com',
        to: 'stelioslagaras@gmail.com',
        subject: 'Geochess Contact Form',
        text: 'Email content'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            // do something useful
        }
    });
}

main().catch(console.error);