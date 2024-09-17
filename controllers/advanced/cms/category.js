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
        // Verify that the user is an admin
        const adminUser = await prismaClient.user.findUnique({
            where: { id: adminId }
        });

        if (!adminUser || adminUser.type !== 'ADMIN') {
            return res.status(401).json({ message: "Unauthorized user. Only admins can create categories." });
        }

        // Handle file upload
        upload.single('background_img')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error(chalk.bgRed('Multer file upload error: '), err);
                return res.status(400).json({ message: "File upload error. Please try again." });
            } else if (err) {
                console.error(chalk.bgRed('Unexpected file upload error: '), err);
                return res.status(500).json({ message: "Internal server error during file upload." });
            }

            const { name, description, serviecTypeId } = req.body;
            const filename = req.file?.filename;

            if (!name || !description || !filename || !serviecTypeId) {
                console.warn(chalk.bgYellow("Validation failed"), req.body, req.file);
                return res.status(400).json({ message: 'Missing required fields: name, description, and background_img file.' });
            }

            try {
                let newNode;


                const serviceNode = await prismaClient.serviceType.findUnique({
                    where: { id: serviecTypeId }
                });

                if (!serviceNode) {
                    return res.status(404).json({ message: "Parent node not found." });
                }

                newNode = await prismaClient.node.create({
                    data: {
                        name,
                        description,
                        isService: true,
                        background_img: `/categoryimages/${filename}`,
                        serviceTypeId: serviecTypeId
                    }
                });

                return res.status(201).json({ message: "Category created successfully", node: newNode });
            } catch (error) {
                if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
                    console.error(chalk.bgRed("Duplicate node name: "), error);
                    return res.status(409).json({ message: "A node with this name already exists." });
                } else if (error.code === 'P2025') {
                    console.error(chalk.bgRed("Parent node not found: "), error);
                    return res.status(404).json({ message: "Parent node not found." });
                } else {
                    console.error(chalk.bgRed("Prisma error: "), error);
                    return res.status(500).json({ message: "Internal server error while creating node." });
                }
            }
        });
    } catch (err) {
        console.error(chalk.bgRed("Unexpected error while adding category: "), err);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
};

const addBranch = async (req, res) => {
    const adminId = req.user?.userId;

    try {
        const adminUser = await prismaClient.user.findUnique({
            where: { id: adminId }
        });

        if (!adminUser || adminUser.type !== 'ADMIN') {
            return res.status(401).json({ message: "Unauthorized user. Only admins can create branches." });
        }

        upload.single('background_img')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error(chalk.bgRed('Multer file upload error: '), err);
                return res.status(400).json({ message: "File upload error. Please try again." });
            } else if (err) {
                console.error(chalk.bgRed('Unexpected file upload error: '), err);
                return res.status(500).json({ message: "Internal server error during file upload." });
            }

            const { name, description, parentId } = req.body;
            const filename = req.file?.filename;

            if (!name || !description || !filename) {
                console.warn(chalk.bgYellow("Validation failed"), req.body, req.file);
                return res.status(400).json({ message: 'Missing required fields: name, description, and background_img file.' });
            }

            try {
                let newNode;

                if (parentId) {
                    const parentNode = await prismaClient.node.findUnique({
                        where: { id: parentId }
                    });

                    if (!parentNode) {
                        return res.status(404).json({ message: "Parent node not found." });
                    }

                    newNode = await prismaClient.node.create({
                        data: {
                            name,
                            description,
                            background_img: `/branchimages/${filename}`,
                            parent: { connect: { id: parentId } }
                        }
                    });
                } else {
                    // Create a new root branch
                    newNode = await prismaClient.node.create({
                        data: {
                            name,
                            description,
                            background_img: `/branchimages/${filename}`
                        }
                    });
                }

                return res.status(201).json({ message: "Branch created successfully", node: newNode });
            } catch (error) {
                if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
                    console.error(chalk.bgRed("Duplicate node name: "), error);
                    return res.status(409).json({ message: "A branch with this name already exists." });
                } else if (error.code === 'P2025') {
                    console.error(chalk.bgRed("Parent node not found: "), error);
                    return res.status(404).json({ message: "Parent node not found." });
                } else {
                    console.error(chalk.bgRed("Prisma error: "), error);
                    return res.status(500).json({ message: "Internal server error while creating branch." });
                }
            }
        });
    } catch (err) {
        console.error(chalk.bgRed("Unexpected error while adding branch: "), err);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
};

// Function to retrieve a branch by ID
const getBranchById = async (req, res) => {
    const { id } = req.params;

    try {
        const branch = await prismaClient.node.findUnique({
            where: { id },
            include: {
                children: true
            }
        });

        if (!branch) {
            return res.status(404).json({ message: `Branch with ID '${id}' not found.` });
        }

        return res.status(200).json({
            id: branch.id,
            name: branch.name,
            description: branch.description,
            background_img: branch.background_img,
            children: branch.children
        });
    } catch (error) {
        console.error("Error retrieving branch: ", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// Function to retrieve the full tree starting from a specific node
const getBranchTree = async (req, res) => {
    const { id } = req.params;

    try {
        const branch = await prismaClient.node.findUnique({
            where: { id },
            include: {
                children: {
                    include: {
                        children: true
                    }
                }
            }
        });

        if (!branch) {
            return res.status(404).json({ message: `Branch with ID '${id}' not found.` });
        }

        return res.status(200).json({
            id: branch.id,
            name: branch.name,
            description: branch.description,
            background_img: branch.background_img,
            children: branch.children
        });
    } catch (error) {
        console.error("Error fetching branch tree:", error);
        return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};


const getLeaves = async (req, res) => {
    try {

        const leaves = await prismaClient.node.findMany({
            where: {
                NOT: {
                    children: {
                        some: {}
                    }
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                background_img: true
            }
        });

        if (leaves.length === 0) {
            return res.status(404).json({ message: "No leaf nodes found." });
        }

        return res.status(200).json({
            message: "Leaf nodes retrieved successfully.",
            leaves
        });
    } catch (error) {
        console.error("Error fetching leaf nodes:", error);
        return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

const getRoots = async (req, res) => {
    try {

        const roots = await prismaClient.node.findMany({
            where: {
                parentId: null
            },
            select: {
                id: true,
                name: true,
                description: true,
                background_img: true,
                children: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (roots.length === 0) {
            return res.status(404).json({ message: "No root nodes found." });
        }

        return res.status(200).json({
            message: "Root nodes retrieved successfully.",
            roots
        });
    } catch (error) {
        console.error("Error fetching root nodes:", error);
        return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

module.exports = {
    addCategory,
    addBranch,
    getRoots,
    getBranchById,
    getBranchTree,
    getLeaves
};
