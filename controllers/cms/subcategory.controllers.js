const prisma = require('@prisma/client')
const chalk = require('chalk')
const prismaClient = new prisma.PrismaClient()
const path = require('path')
const fs = require('fs')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', '..', 'subcategoryimages')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

const addSubCategory = async (req, res) => {
    const adminId = req.user?.userId
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
        upload.single('background_img')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: "File upload error" })
            } else if (err) {
                return res.status(500).json({ message: "Internal server error" })
            }

            const { name, description, categoryId } = req.body

            if (!name || !description || !req.file || !categoryId) {
                console.log(chalk.bgYellow("Sub-category creation params check failed"), req.body, req.file);
                return res.status(400).json({ message: 'name, background_img file, categoryId and description are required' });
            }

            const filename = req.file.filename

            try {
                const subcategory = await prismaClient.subCategory.create({
                    data: {
                        name,
                        background_img: `/subcategoryimages/${filename}`,
                        description,
                        categoryId
                    }
                })
                return res.status(201).json({ message: "Sub-category created successfully", subcategory })
            } catch (error) {
                if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
                    console.log(chalk.bgRedBright("A Sub-category with this name already exists"), error)
                    return res.status(409).json({ message: "A Sub-category with this name already exists" })
                }
                throw error
            }
        })
    } catch (err) {
        console.log(chalk.bgRedBright("Failed to add sub-category"), err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user?.userId;

    try {
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: adminId,
                type: 'ADMIN'
            }
        });

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized User" });
        }

        // Use multer to handle file uploads
        upload.single('background_img')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: 'File upload error' });
            } else if (err) {
                return res.status(500).json({ message: 'Internal server error' });
            }

            const { name, description, categoryId } = req.body;

            const existingCategory = await prismaClient.subCategory.findUnique({
                where: { id: id },
            });

            if (!existingCategory) {
                return res.status(404).json({ message: 'Sub-category not found' });
            }

            const updateData = {
                name: name || existingCategory.name,
                description: description || existingCategory.description,
                categoryId : categoryId || existingCategory.categoryId
            };

            if (req.file) {
                updateData.background_img = `/subcategoryimages/${req.file.filename}`;
                // Optionally delete the old file if needed
                const oldFilePath = path.join(__dirname, '..', '..', 'subcategoryimages', existingCategory.background_img.split('/subcategoryimages/')[1]);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            const updatedCategory = await prismaClient.subCategory.update({
                where: { id: id },
                data: updateData,
            });

            return res.status(200).json({ message: 'Sub-category updated successfully', category: updatedCategory });
        });
    } catch (error) {
        console.error('Failed to update Sub-category', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// const toggleCategoryLiveStatus = async (req, res) => {
//     const { id } = req.params;
//     const { is_live } = req.body;
//     console.log(req.body)
//     if (typeof is_live !== 'boolean') {
//         return res.status(400).json({ message: 'Invalid input' });
//     }
//     const adminId = req.user?.userId

//     try {
//         const adminUser = await prismaClient.user.findUnique({
//             where: {
//                 id: adminId,
//                 type: 'ADMIN'
//             }
//         });

//         if (!adminUser) {
//             return res.status(401).json({ message: "Unauthorized User" })
//         }
//         const Category = await prismaClient.subCategory.update({
//             where: { id },
//             data: { is_live }
//         });
//         res.status(200).json({ message: `Category ${is_live ? 'activated' : 'deactivated'} successfully`, Category });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };


const getSubCategory = async (req, res) => {
    try {
        const subcategories = await prismaClient.subCategory.findMany({
            include : {
                Category : true
            }
        })

        return res.status(200).json({ message: "Fetched Sub-categories successfully", subcategories })
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

const deleteSubCategory = async (req, res) => {
    const adminId = req.user?.userId
    const { categoryId } = req.params
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

        const deletedCategory = await prismaClient.subCategory.delete({
            where: {
                id: categoryId
            }
        })

        console.log(deletedCategory)
        return res.status(200).json({ message: 'Deleted Sub-category successfully', deleted: deletedCategory })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    addSubCategory,
    getSubCategory,
    updateSubCategory,
    deleteSubCategory
}