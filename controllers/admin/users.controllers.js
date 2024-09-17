const prisma = require('@prisma/client');
const { sent_payment_mail, sent_otp } = require('../../helpers/mailer');
const multer = require('multer');
const chalk = require('chalk');
const prismaClient = new prisma.PrismaClient()

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


const getUsers = async (req, res) => {
    const userId = req.user?.userId

    try {
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized User. No user connection found" })
        }
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: userId,
                type: 'ADMIN'
            }
        });

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized User" })
        }

        const getAllUsers = await prismaClient.homeOwner.findMany({
            include: {
                User: true
            }
        })

        return res.status(200).json({ message: "Gotcha! all users", users: getAllUsers })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const getMaterialUsers = async (req, res) => {
    const userId = req.user?.userId
    try {
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: userId,
                type: 'ADMIN'
            }
        });

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized User" })
        }

        const getAllMaterialProviders = await prismaClient.materialProvider.findMany({
            include: {
                User: true,
                brand_category: true,
                brand_subcategory: true
            }
        })

        return res.status(200).json({ message: "Gotcha! all material providers", users: getAllMaterialProviders })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


const getServiceUsers = async (req, res) => {
    const userId = req.user?.userId
    try {
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: userId,
                type: 'ADMIN'
            }
        });

        console.log(adminUser, userId, req.user)

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized User" })
        }

        const getAllServiceProviders = await prismaClient.serviceProvider.findMany({
            include: {
                brand_category: true,
                User: true
            }
        })

        return res.status(200).json({ message: "Gotcha! all service providers", users: getAllServiceProviders })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const getServiceUsersById = async (req, res) => {
    const userId = req.user?.userId
    const { suid } = req.params
    try {
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: userId,
                type: 'ADMIN'
            }
        });

        console.log(adminUser, userId, req.user)

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized User" })
        }

        const serviceProvider = await prismaClient.serviceProvider.findFirst({
            where: {
                userId: suid
            },
            include: {
                brand_category: true,
                User: true
            }
        })

        return res.status(200).json({ message: "Gotcha! data for " + serviceProvider.name, user: serviceProvider })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const sentPaymentLink = async (req, res) => {
    const adminId = req.user?.userId
    const { userId, payment_link } = req.body
    console.log(userId, payment_link)
    if (!userId || !payment_link) {
        return res.status(401).json({ message: "Failed to proceed" })
    }
    try {
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: adminId,
                type: 'ADMIN'
            }
        });

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized User" })
        }

        const user = await prismaClient.user.update({
            where: { id: userId },
            data: { status: 'LINKED', payment_link }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const username = user.type == 'SERVICE_PROVIDER' ? user.ServiceProvider?.name
            :
            user.type == 'MATERIAL_PROVIDER' ? user.MaterialProvider?.name : user.HomeOwner?.name

        await sent_payment_mail(user.email, payment_link, username)

        return res.status(200).json({ message: "Payment link sent successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const sentPasscodeToUser = async (req, res) => {
    const adminId = req.user?.userId
    const { userId } = req.body
    try {
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: adminId,
                type: 'ADMIN'
            }
        });

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized User" })
        }
        const otp = generateOTP();

        const user = await prismaClient.user.update({
            where: { id: userId },
            data: { status: 'AUTHORIZED', passcode: otp }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const username = user.type == 'SERVICE_PROVIDER' ? user.ServiceProvider?.name
            :
            user.type == 'MATERIAL_PROVIDER' ? user.MaterialProvider?.name : user.HomeOwner?.name

        await sent_otp(otp, user.email, username)


        return res.status(200).json({ message: "Passcode sent to user successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const deleteUser = async (req, res) => {
    const adminId = req.user?.userId
    const { userId } = req.body
    try {
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: adminId,
                type: 'ADMIN'
            }
        });

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized User" })
        }

        const user = await prismaClient.user.delete({
            where: { id: userId }
        })

        return res.status(200).json({ message: "User deleted successfully", user })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


const updateUser = async (req, res) => {
    const uploadMiddleware = upload.fields([
        { name: 'profile_gallery', maxCount: 10 },
        { name: 'profile_pic', maxCount: 1 },
        { name: 'profile_doc', maxCount: 1 },
        { name: 'project_img', maxCount: 1 }
    ]);
    const adminId = req.user?.userId
    const adminUser = await prismaClient.user.findUnique({
        where: {
            id: adminId,
            type: 'ADMIN'
        }
    });

    if (!adminUser) {
        return res.status(401).json({ message: "Unauthorized User" })
    }
    uploadMiddleware(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: err.message });
        }

        const { userId } = req.body;
        const { name, mobile, firm_name, firm_address, bio, categoryId, instagram, facebook, linkedin } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        try {
            const user = await prismaClient.user.findUnique({
                where: { id: userId }
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
                    where: { userId }
                });

                existingGallery = userData.gallery || [];
                existingProfilePic = userData.profile_pic;
                existingProfileDoc = userData.profile_doc;
            }

            // upload fieks 
            const profileGallery = req.files['profile_gallery'] ? req.files['profile_gallery'].map(file => file.path) : existingGallery;
            const profilePic = req.files['profile_pic'] ? req.files['profile_pic'][0].path : existingProfilePic;
            const profileDoc = req.files['profile_doc'] ? req.files['profile_doc'][0].path : existingProfileDoc;

            // old images to be removed lol
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

            const updatedData = {
                ...(name && { name }),
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
                ...(profileGallery.length && { gallery: profileGallery }),

            };

            if (user.type === 'SERVICE_PROVIDER') {
                await prismaClient.serviceProvider.update({
                    where: { userId },
                    data: updatedData,
                });
            } else if (user.type === 'MATERIAL_PROVIDER') {
                await prismaClient.materialProvider.update({
                    where: { userId },
                    data: updatedData,
                });
            } else if (user.type === 'HOME_OWNER') {
                await prismaClient.homeOwner.update({
                    where: { userId },
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


module.exports = {
    getUsers,
    getMaterialUsers,
    getServiceUsers,
    getServiceUsersById,
    sentPaymentLink,
    sentPasscodeToUser,
    deleteUser,
    updateUser
}