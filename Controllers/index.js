const users = require('../Models/Inventory');
const { totp } = require('otplib');
const nodemailer = require('nodemailer');
totp.options = { digits: 6 };

function EmailOtp(token){
    return {
        from: 's.nandasagarreddy@gmail.com',
        to: userId,
        subject: 'OTP Verification',
        text: `Your OTP is: ${token}`,
    };
}
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'will be sent to you through email',
      pass: 'will be sent to you through email',
    },
  });

module.exports.createUser = async function(req,res){
    const userId= req.body.userId;
    const token = totp.generate(`${Date.now()}`);
    try{
        let user = await users.create({userId : userId});
        user.otpSent = token;
        user.otpAttempts++;
        user.otpGeneratedAt = Date.now();
        await user.save();
        const info = await transporter.sendMail(EmailOtp(token));
        console.log('Email sent:', info.messageId);

        res.json({
            res: "ok",
            userId: req.body.userId,
            otp: token,
            message: "OTP sent successfully to your Mail-Id !!!"
        });
    }catch(error){
        console.log(error);
        if(error.code === 11000){
            res.json({
                res: "not ok",
                error: "user already existing"
            });
            return;
        }
        res.json({
            res: "not ok",
            error: error
        })
    }
}

module.exports.verifyOtp = async function(req, res){
    const userId = req.body.userId;
    const receivedOtp = req.body.otpEntered;
    try{
        const user = await users.findOne({userId});

        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }

        if(user.otpSent.length === 0){
            return res.status(400).json({ error: 'Cant reuse OTP, generate again!!!' });
        }

        if (user.otpGeneratedAt && (Date.now() - user.otpGeneratedAt) > (5 * 60 * 1000)) {
            return res.status(400).json({ error: 'OTP has expired. Please generate a new OTP.' });
        }

        if (receivedOtp !== user.otpSent) {
            return res.status(400).json({ error: 'Incorrect OTP' });
        }

        user.otpSent = "";
        user.lastLogin = Date.now();
        await user.save();
        return res.json({ message: 'OTP verified successfully' });

    }catch(err){
        return res.status(500).json({ error: 'Internal server error' });
    }
    
}

module.exports.getOtp = async function(req, res){
    const userId  = req.body.userId;
    try{
        const user = await users.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if(user.otpAttempts > 5){
            const blockExpirationTime = Date.now() + (60 * 60 * 1000);
            user.blockedUntil = new Date(blockExpirationTime);
            await user.save();
            return res.status(403).json({ error: 'User is blocked. Retry after 1 hour' });
        }
        if (user.blockedUntil && user.blockedUntil > Date.now()) {
            const remainingTime = Math.ceil((user.blockedUntil - Date.now()) / (1000 * 60));
            return res.status(403).json({ error: `User is blocked. Retry after ${remainingTime} minutes` });
        }
        if (user.otpGeneratedAt && (Date.now() - user.otpGeneratedAt) < (1000 * 60)) {
            return res.status(400).json({ error: 'Try again after 1 minute' });
        }
        const token = totp.generate(`${Date.now()}`);
        user.otpAttempts++;
        user.otpGeneratedAt = Date.now();
        user.otpSent = token;
        await user.save();
        const info = await transporter.sendMail(EmailOtp(token));
        console.log('Email sent:', info.messageId);

        return res.json({
            res: "ok",
            userId: userId,
            otp: token,
            message: "Existing User!!!"
        });
    }catch(err){
        return res.status(500).json({ error: 'Internal server error' });
    }
}
