const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config({ path: ".env" });

var smtpTransport = nodemailer.createTransport({
    service: "Hostinger",
    host: "smtp.hostinger.com",
    secure: true,
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS,
    }
});
module.exports.sendOTPEmail = async (email, otp) => {
    try {
        await smtpTransport.sendMail({
            from: process.env.OTPEMAIL,
            to: email,
            subject: "OTP from Sangam Hotels",
            text: `Your OTP is ${otp}  Dont share this OTP and Email to others`,
            html: `Your OTP is <b>${otp}</b>  Dont share this OTP and Email to others`,
        });
    } catch (err) {
        console.log(err);
    }
}
module.exports.sendFeedback = async (email, data) => {
    await smtpTransport.sendMail({
        from: process.env.ADMINEMAIL,
        to: email,
        subject: "Feedback Email",
        text: `Some feedback is there`,
        html: `<h1>Hello</h1>`,
    });
}