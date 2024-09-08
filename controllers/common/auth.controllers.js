const prisma = require('@prisma/client')
const chalk = require('chalk')
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { sent_welcome_mail } = require('../../helpers/mailer');
const prismaClient = new prisma.PrismaClient()


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
        } else if (file.fieldname === 'brand_logo') {
            uploadPath = `uploads/brand_logo`;
        }

        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Get the file extension
        const baseName = Date.now().toString(); // Base name using timestamp
        const fileName = ext ? `${baseName}${ext}` : `${baseName}.jpg`; // Fallback to '.jpg' if no extension

        cb(null, fileName);
    }
});



const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profile_gallery' || file.fieldname === 'profile_pic' || file.fieldname === 'brand_logo') {
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
        { name: 'project_img', maxCount: 1 },
        { name: 'brand_logo', maxCount: 1 }
    ]);

    uploadMiddleware(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: err.message });
        }

        const { email, type, name, mobile, firm_name, intrest, firm_address, bio, instagram, facebook, twitter, linkedin, subcategoryId, brand_name, company_name, company_address, contact_person, categoryId, country, state, city, pincode } = req.body;

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
                    status: 'PENDING',
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
                        instagram,
                        facebook,
                        twitter,
                        linkedin,
                        country,
                        state,
                        city,
                        pincode,
                        profile_doc: req.files['profile_doc'] ? req.files['profile_doc'][0].path : null,
                        profile_pic: req.files['profile_pic'] ? req.files['profile_pic'][0].path : null,
                        brand_logo: req.files['brand_logo'] ? req.files['brand_logo'][0].path : null,
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
                        country,
                        state,
                        city,
                        pincode,
                        bio,
                        categoryId,
                        subcategoryId,
                        instagram,
                        facebook,
                        twitter,
                        linkedin,
                        profile_doc: req.files['profile_doc'] ? req.files['profile_doc'][0].path : null,
                        brand_logo: req.files['brand_logo'] ? req.files['brand_logo'][0].path : null,
                        profile_pic: req.files['profile_pic'] ? req.files['profile_pic'][0].path : null,
                        gallery: req.files['profile_gallery'] ? req.files['profile_gallery'].map(file => file.path) : [],
                        userId: user.id
                    }
                });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email, type: user.type },
                process.env.JWT_SECRET
            );

            await sent_welcome_mail(email)

            return res.status(201).json({
                message: 'User registered successfully. OTP sent to email.',
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    type: user.type,
                    is_admin: user.is_admin,
                    status: user.status
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
                status: user.status
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
        const user = await prismaClient.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Please Register first inorder to verify account' });
        }


        const verifyUser = await prismaClient.user.update({
            where: { id: user.id },
            data: { status: 'VERIFIED' }
        })

        const token = jwt.sign(
            { userId: verifyUser.id, email: verifyUser.email, type: verifyUser.type },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            message: "User verified successfully successfully",
            token: token,
            user: {
                id: verifyUser.id,
                email: verifyUser.email,
                type: verifyUser.type,
                is_admin: verifyUser.is_admin,
                status: verifyUser.status
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
        const user = await prismaClient.user.findUnique({ where: { email } });
        console.log(chalk.bgYellowBright("setPassword params check failed"), req.body, user);

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
            user: {
                id: setPassToUser.id,
                email: setPassToUser.email,
                type: setPassToUser.type,
                is_admin: setPassToUser.is_admin,
                status: setPassToUser.status
            }
        });

    } catch (err) {
        console.log(chalk.bgYellowBright('Internal Server issue in setPassword'), err);
        return res.status(500).json({
            message: "Internal Server Issue"
        });
    }
}


const updateUser = async (req, res) => {
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

        const { suid } = req.params;
        const { name, mobile, intrest, firm_name, firm_address, bio, categoryId, instagram, facebook, linkedin } = req.body;
        console.log(suid)
        if (!suid) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        try {
            const user = await prismaClient.user.findUnique({
                where: { id: suid }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }


            let existingGallery = [];
            let existingProfilePic;
            let existingProfileDoc;

            if (user.type === 'SERVICE_PROVIDER' || user.type === 'MATERIAL_PROVIDER') {
                const userTypeTable = user.type === 'SERVICE_PROVIDER' ? prismaClient.serviceProvider : prismaClient.materialProvider;

                const userData = await userTypeTable.findUnique({
                    where: { suid }
                });

                existingGallery = userData.gallery || [];
                existingProfilePic = userData.profile_pic;
                existingProfileDoc = userData.profile_doc;
            }
            let profileGallery, profilePic, profileDoc = null

            // upload fieks 
            if (user.type === 'SERVICE_PROVIDER' || user.type === 'MATERIAL_PROVIDER') {
                profileGallery = req.files['profile_gallery'] ? req.files['profile_gallery'].map(file => file.path) : existingGallery;
                profilePic = req.files['profile_pic'] ? req.files['profile_pic'][0].path : existingProfilePic;
                profileDoc = req.files['profile_doc'] ? req.files['profile_doc'][0].path : existingProfileDoc;
                if (profilePic && existingProfilePic && profilePic !== existingProfilePic) {
                    if (fs.existsSync(existingProfilePic)) {
                        fs.unlinkSync(existingProfilePic);
                    }
                }
                if (profileDoc && existingProfileDoc && profileDoc !== existingProfileDoc) {
                    if (fs.existsSync(existingProfileDoc)) {
                        fs.unlinkSync(existingProfileDoc);
                    }
                }
    
                existingGallery.forEach(image => {
                    if (!profileGallery.includes(image)) {
                        if (fs.existsSync(image)) {
                            fs.unlinkSync(image);
                        }
                    }
                });
            }
            // old images to be removed lol


            const updatedData = {
                ...(name && { name }),
                ...(intrest && { intrest }),
                ...(mobile && { mobile }),
                ...(firm_name && { firm_name }),
                ...(firm_address && { firm_address }),
                ...(bio && { bio }),
                ...(instagram && { instagram }),
                ...(linkedin && { linkedin }),
                ...(facebook && { facebook }),
                ...(categoryId && { categoryId }),
                ...(profilePic && { profile_pic: profilePic }),
                ...(profileDoc && { profile_doc: profileDoc }),
                ...(profileGallery?.length && { gallery: profileGallery }),

            };

            if (user.type === 'SERVICE_PROVIDER') {
                await prismaClient.serviceProvider.update({
                    where: { userId: suid },
                    data: updatedData,
                });
            } else if (user.type === 'MATERIAL_PROVIDER') {
                await prismaClient.materialProvider.update({
                    where: { userId: suid },
                    data: updatedData,
                });
            } else if (user.type === 'HOME_OWNER') {
                console.log(updatedData)
                await prismaClient.homeOwner.update({
                    where: { userId: suid },
                    data: updatedData,
                });
            }

            return res.status(200).json({ message: 'User updated successfully' });
        } catch (err) {
            console.log(chalk.bgRedBright("Failed to update user"), err);
            return res.status(500).json({ message: "Internal server issue" });
        }
    });
};

const getProfile = async (req, res) => {
    const userId = req.user?.userId
    try {
        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            include: {
                HomeOwner: true,
                ServiceProvider: true,
                MaterialProvider: true
            }
        })
        return res.status(200).json({ message: 'User fetched successfully', user: user });
    } catch (err) {
        console.log(chalk.bgRedBright("Failed to update user"), err);
        return res.status(500).json({ message: "Internal server issue" });
    }
}

const getServiceUsersById = async (req, res) => {
    const { suid } = req.params
    const userId = req.user?.userId

    try {
        console.log(suid, userId)
        const serviceProvider = await prismaClient.serviceProvider.findUnique({
            where: {
                userId: suid
            },
            include: {
                brand_category: true,
                User: true
            }
        })

        return res.status(200).json({ message: "Gotcha! data for ", user: serviceProvider })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const getHomeOwnerUsersById = async (req, res) => {
    const { suid } = req.params
    const userId = req.user?.userId

    try {
        console.log(suid, userId)
        const serviceProvider = await prismaClient.homeOwner.findUnique({
            where: {
                userId: suid
            },
            include: {
                User: true
            }
        })

        return res.status(200).json({ message: "Gotcha! data for ", user: serviceProvider })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const getMaterialUsersById = async (req, res) => {
    const { suid } = req.params
    const userId = req.user?.userId

    try {
        console.log(suid, userId)
        const serviceProvider = await prismaClient.materialProvider.findUnique({
            where: {
                userId: suid
            },
            include: {
                brand_category: true,
                brand_subcategory: true,
                User: true
            }
        })

        return res.status(200).json({ message: "Gotcha! data for ", user: serviceProvider })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

module.exports = {
    registerUser,
    loginUser,
    setPassword,
    verifyUser,
    updateUser,
    getProfile,
    getServiceUsersById,
    getMaterialUsersById,
    getHomeOwnerUsersById
}