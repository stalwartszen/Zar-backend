const prisma = require('@prisma/client');
const chalk = require('chalk');
const prismaClient = new prisma.PrismaClient();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../../advuploads', 'categoryimages');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const addCategory = async (req, res) => {
    const adminId = req.user?.userId;

    try {
        const adminUser = await prismaClient.user.findUnique({
            where: { id: adminId }
        });

        if (!adminUser || adminUser.type !== 'ADMIN') {
            return res.status(401).json({ message: "Unauthorized user. Only admins can create categories." });
        }

        upload.single('background_img')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error(chalk.bgRed('Multer file upload error: '), err);
                return res.status(400).json({ message: "File upload error. Please try again." });
            } else if (err) {
                console.error(chalk.bgRed('Unexpected file upload error: '), err);
                return res.status(500).json({ message: "Internal server error during file upload." });
            }

            const { name, description, serviceId, parentCategoryId } = req.body;
            const filename = req.file?.filename;

            if (!name || !description || !filename || (serviceId === undefined && !parentCategoryId)) {
                console.warn(chalk.bgYellow("Validation failed"), req.body, req.file);
                return res.status(400).json({ message: 'Missing required fields: name, description, background_img file, and serviceId or parentCategoryId.' });
            }

            try {
                let newCategory;

                if (parentCategoryId) {
                    // Create a subcategory
                    const parentCategory = await prismaClient.category.findUnique({
                        where: { id: parentCategoryId }
                    });

                    if (!parentCategory) {
                        return res.status(404).json({ message: "Parent category not found." });
                    }

                    newCategory = await prismaClient.subCategory.create({
                        data: {
                            name,
                            background_img: `/categoryimages/${filename}`,
                            description,
                            parentCategoryId
                        }
                    });
                } else {
                    // Create a top-level category
                    if (!serviceId) {
                        return res.status(400).json({ message: 'Missing required serviceId for top-level category.' });
                    }

                    newCategory = await prismaClient.category.create({
                        data: {
                            name,
                            background_img: `/categoryimages/${filename}`,
                            description,
                            serviceTypeId: serviceId
                        }
                    });
                }

                return res.status(201).json({ message: "Category created successfully", category: newCategory });
            } catch (error) {
                if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
                    console.error(chalk.bgRed("Duplicate category name: "), error);
                    return res.status(409).json({ message: "A category or subcategory with this name already exists." });
                } else if (error.code === 'P2025') {
                    console.error(chalk.bgRed("Parent category not found: "), error);
                    return res.status(404).json({ message: "Parent category not found." });
                } else {
                    console.error(chalk.bgRed("Prisma error: "), error);
                    return res.status(500).json({ message: "Internal server error while creating category." });
                }
            }
        });
    } catch (err) {
        console.error(chalk.bgRed("Unexpected error while adding category: "), err);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
};

// Admin: Get Category by Parent Name
const getCategoryByParentName = async (req, res) => {
    const adminId = req.user?.userId;
    const { parentName } = req.query;

    try {
        const adminUser = await prismaClient.user.findUnique({
            where: { id: adminId }
        });

        if (!adminUser || adminUser.type !== 'ADMIN') {
            return res.status(401).json({ message: "Unauthorized user. Only admins can access this resource." });
        }

        if (!parentName) {
            return res.status(400).json({ message: "Parent category name is required." });
        }

        // Fetch parent category by name
        const parentCategory = await prismaClient.category.findUnique({
            where: { name: parentName }
        });

        if (!parentCategory) {
            return res.status(404).json({ message: `Parent category '${parentName}' not found.` });
        }

        // Fetch all subcategories by parent
        const subcategories = await prismaClient.subCategory.findMany({
            where: { parentCategoryId: parentCategory.id },
            select: {
                id: true,
                name: true,
                description: true,
                background_img: true
            }
        });

        if (subcategories.length === 0) {
            return res.status(404).json({ message: `No subcategories found for the parent category '${parentName}'.` });
        }

        return res.status(200).json({
            message: `Subcategories for parent category '${parentName}' retrieved successfully.`,
            parentCategory: {
                id: parentCategory.id,
                name: parentCategory.name,
                description: parentCategory.description,
                serviceTypeId: parentCategory.serviceTypeId
            },
            subcategories
        });
    } catch (err) {
        console.error("Error retrieving categories: ", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// Normal Users: Get Category Tree
const getCategoryTree = async (req, res) => {
    const { parentName } = req.query;

    if (!parentName) {
        return res.status(400).json({ message: "Parent category name is required." });
    }

    try {
        const parentCategory = await prismaClient.category.findUnique({
            where: { name: parentName },
            include: {
                subCategories: true // Adjusted to match your schema
            }
        });

        if (!parentCategory) {
            return res.status(404).json({ message: `Parent category '${parentName}' not found.` });
        }

        const categoryData = {
            parent: {
                id: parentCategory.id,
                name: parentCategory.name,
                description: parentCategory.description,
                background_img: parentCategory.background_img,
            },
            subcategories: parentCategory.subCategories.map(subcat => ({
                id: subcat.id,
                name: subcat.name,
                description: subcat.description,
                background_img: subcat.background_img,
            }))
        };

        return res.status(200).json(categoryData);
    } catch (error) {
        console.error("Error fetching category tree:", error);

        if (error.code === 'P2025') { 
            return res.status(404).json({ message: "Category not found." });
        }
        return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

module.exports = {
    addCategory,
    getCategoryByParentName,
    getCategoryTree
};
