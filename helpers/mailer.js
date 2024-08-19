const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'admin@zarluxury.com',
        pass: 'Zara#24Admin'
    }
});


const sent_otp = async (otp, usermail) => {
    try {
        const mailOptions = {
            from: 'admin@zarluxury.com',
            to: usermail,
            subject: 'OTP/Passcode ZAR',
            text: `Zar Login passcode to login first time ${otp}`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error)
    }
}


const sent_welcome_mail = async (useremail) => {
    try {
        const mailOptions = {
            from: 'admin@zarluxury.com',
            to: useremail,
            subject: 'Welcome to zar',
            text: `Wait until admin approves`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error)
    }
}


const sent_payment_mail = async (useremail, payment_link) => {
    try {
        const mailOptions = {
            from: 'admin@zarluxury.com',
            to: useremail,
            subject: 'Payment to zar',
            text: `${payment_link} Wait until admin approves your payment`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    sent_otp,
    sent_payment_mail,
    sent_welcome_mail
}