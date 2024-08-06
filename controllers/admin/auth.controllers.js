const prisma = require('@prisma/client')
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const prismaClient = new prisma.PrismaClient();
const jwt = require('jsonwebtoken')
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

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const registerAdmin = async (req, res) => {
    const { email, reqEmail, password } = req.body;

    if (!email || !password) {
        console.log(chalk.bgYellowBright("Registration params check failed"), req.body);
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        if (reqEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({
                message: "Unauthorized: Only specific email allowed for admin registration"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                type: 'ADMIN',
                is_admin: true,
                have_access: true,
                is_verified: true,
            }
        });

        if (newAdmin) {
            return res.status(201).json({
                message: "Admin registered successfully",
                user: newAdmin
            });
        } else {
            return res.status(400).json({
                message: "Failed to register admin"
            });
        }
    } catch (err) {
        console.log(chalk.bgYellowBright('Internal Server issue in registerAdmin'), err);
        return res.status(500).json({
            message: "Internal Server Issue"
        });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.log(chalk.bgYellowBright("Login params check failed"), req.body);
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await prismaClient.user.findFirst({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, type: user.type },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                email: user.email,
                type: user.type,
                is_admin: user.is_admin,
                is_verified: user.is_verified,
                have_access: user.have_access
            }
        });
    } catch (err) {
        console.log(chalk.bgYellowBright('Internal Server issue in loginAdmin'), err);
        return res.status(500).json({
            message: "Internal Server Issue"
        });
    }
};

const giveAccessToUser = async (req, res) => {
    const reqUser = req.user.userId
    const { userId } = req.body
    if (!userId) {
        console.log(chalk.bgYellowBright("giveAccessToUser params check failed"), req.body);
        return res.status(400).json({ message: 'userId are required' });
    }
    try {
        const exitUser = await prismaClient.user.findFirst({ where: { id: reqUser, is_admin: true } })

        if (!exitUser) {
            return res.status(403).json({
                message: "Unauthorized: Only specific email allowed for admin controls"
            });
        }
        const otp = generateOTP();

        const accessUser = await prismaClient.user.update({
            where: { id: userId },
            data: { have_access: true, passcode: otp }
        });

        const mailOptions = {
            from: 'admin@zarluxury.com',
            to: accessUser.email,
            subject: 'OTP/Passcode ZAR',
            text: `Zar Login passcode to login first time ${otp}`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "Access granted successfully",
            user: accessUser
        });
    } catch (err) {
        console.log(chalk.bgYellowBright('Internal Server issue in giveAccessToUser'), err);
        return res.status(500).json({
            message: "Internal Server Issue"
        });
    }
}

module.exports = {
    registerAdmin,
    loginAdmin,
    giveAccessToUser
};
