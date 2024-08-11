const prisma = require('@prisma/client')
const chalk = require('chalk')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken')
const prismaClient = new prisma.PrismaClient()

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath;


        if (file.fieldname === 'profile_gallery') {
            uploadPath = `uploads/profile_gallery`;
        } else if (file.fieldname === 'profile_pic') {
            uploadPath = `uploads/profile_pics`;
        } else if (file.fieldname === 'profile_doc') {
            uploadPath = `uploads/profile_docs`;
        } else if (file.fieldname === 'project_img') {
            uploadPath = `uploads/project_imgs`;
        }

        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profile_gallery' || file.fieldname === 'profile_pic') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    } else if (file.fieldname === 'profile_doc') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Not a PDF! Please upload only PDF files.'), false);
        }
    } else {
        cb(new Error('Unexpected field'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const registerUser = async (req, res) => {
    const uploadMiddleware = upload.fields([
        { name: 'profile_gallery', maxCount: 10 },
        { name: 'profile_pic', maxCount: 1 },
        { name: 'profile_doc', maxCount: 1 },
        { name: 'project_img', maxCount: 1 }
    ]);

    uploadMiddleware(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: err.message });
        }

        const { email, type, name, mobile, firm_name, intrest, firm_address, bio, brand_name, company_name, company_address, contact_person, categoryId, social_links } = req.body;

        if (!email || !type) {
            console.log(chalk.bgYellowBright("Registration params check failed"), req.body);
            return res.status(400).json({ message: 'Email and type are required' });
        }

        try {
            const existUser = await prismaClient.user.findFirst({
                where: { email }
            });
            if (existUser) {
                return res.status(400).json({ message: 'User already exists' });
            }


            const user = await prismaClient.user.create({
                data: {
                    email,
                    // password: hashedPassword,
                    type
                }
            });

            req.body.userId = user.id; // Set the userId in req.body for multer

            if (type === 'HOME_OWNER') {
                await prismaClient.homeOwner.create({
                    data: {
                        name,
                        mobile,
                        intrest,
                        userId: user.id
                    }
                });
            } else if (type === 'SERVICE_PROVIDER') {
                await prismaClient.serviceProvider.create({
                    data: {
                        name,
                        mobile,
                        firm_name,
                        firm_address,
                        bio,
                        categoryId,
                        social_links,
                        profile_doc: req.files['profile_doc'] ? req.files['profile_doc'][0].path : null,
                        profile_pic: req.files['profile_pic'] ? req.files['profile_pic'][0].path : null,
                        gallery: req.files['profile_gallery'] ? req.files['profile_gallery'].map(file => file.path) : [],
                        userId: user.id
                    }
                });
            } else if (type === 'MATERIAL_PROVIDER') {
                const category = await prismaClient.category.findUnique({
                    where: { id: categoryId }
                });

                if (!category) {
                    return res.status(400).json({ message: 'Invalid categoryId' });
                }
                await prismaClient.materialProvider.create({
                    data: {
                        name,
                        mobile,
                        firm_name,
                        firm_address,
                        bio,
                        categoryId,
                        social_links,
                        profile_doc: req.files['profile_doc'] ? req.files['profile_doc'][0].path : null,
                        profile_pic: req.files['profile_pic'] ? req.files['profile_pic'][0].path : null,
                        gallery: req.files['profile_gallery'] ? req.files['profile_gallery'].map(file => file.path) : [],
                        userId: user.id
                    }
                });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email, type: user.type },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const mailOptions = {
                from: 'admin@zarluxury.com',
                to: email,
                subject: 'Welcome to zar',
                text: `Wait until admin approves`
            };

            await transporter.sendMail(mailOptions);

            return res.status(201).json({
                message: 'User registered successfully. OTP sent to email.',
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
            console.log(chalk.bgRedBright("Failed to Register user"), err);

            try {
                const createdUser = await prismaClient.user.findFirst({
                    where: { email }
                });

                if (createdUser) {
                    await prismaClient.user.delete({
                        where: { id: createdUser.id }
                    });
                    console.log(chalk.yellow("Deleted partially created user"), createdUser.id);
                }
            } catch (deleteErr) {
                console.log(chalk.bgRedBright("Failed to delete partially created user"), deleteErr);
            }

            if (err.code === 'P2003') {
                return res.status(400).json({ message: 'Invalid categoryId: Foreign key constraint failed' });
            }

            return res.status(500).json({ message: "Internal server issue" });
        }
    });
};


const loginUser = async (req, res) => {
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
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
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
        console.log(chalk.bgYellowBright('Internal Server issue in login'), err);
        return res.status(500).json({
            message: "Internal Server Issue"
        });
    }
};

const verifyUser = async (req, res) => {
    const { email, passcode } = req.body
    if (!email || !passcode) {
        console.log(chalk.bgYellowBright("verifyUser params check failed"), req.body);
        return res.status(400).json({ message: 'Email and passcode are required' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Please Register first inorder to verify account' });
        }


        const verifyUser = await prismaClient.user.update({
            where: { id: user.id },
            data: { is_verified: true }
        })

        return res.status(200).json({
            message: "User verified successfully successfully",
            token: token,
            user: {
                id: verifyUser.id,
                email: verifyUser.email,
                type: verifyUser.type,
                is_admin: verifyUser.is_admin,
                is_verified: verifyUser.is_verified,
                have_access: verifyUser.have_access
            }
        });
    } catch (err) {
        console.log(chalk.bgYellowBright('Internal Server issue in verifyUser'), err);
        return res.status(500).json({
            message: "Internal Server Issue"
        });
    }
}

const setPassword = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        console.log(chalk.bgYellowBright("setPassword params check failed"), req.body);
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Please Register first inorder to set password' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);


        const setPassToUser = await prismaClient.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }

        })
        return res.status(200).json({
            message: "Password generated successfully",
            token: token,
            user: {
                id: setPassToUser.id,
                email: setPassToUser.email,
                type: setPassToUser.type,
                is_admin: setPassToUser.is_admin,
                is_verified: setPassToUser.is_verified,
                have_access: setPassToUser.have_access
            }
        });

    } catch (err) {
        console.log(chalk.bgYellowBright('Internal Server issue in setPassword'), err);
        return res.status(500).json({
            message: "Internal Server Issue"
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    setPassword,
    verifyUser
}