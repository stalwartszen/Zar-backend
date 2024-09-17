const prisma = require('@prisma/client')
const chalk = require('chalk')
const prismaClient = new prisma.PrismaClient()
const path = require('path')
const fs = require('fs')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', '..', 'serviceimages')
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

const addService = async (req, res) => {
    const adminId = req.user?.userId
    try {
        console.log(adminId)
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

            const { name, description } = req.body
            console.log(req.body)

            if (!name || !description || !req.file) {
                console.log(chalk.bgYellow("Service creation params check failed"), req.body, req.file);
                return res.status(400).json({ message: 'name, background_img file and description are required' });
            }

            const filename = req.file.filename

            try {
                const service = await prismaClient.serviceType.create({
                    data: {
                        name,
                        background_img: `/serviceimages/${filename}`,
                        description
                    }
                })
                return res.status(201).json({ message: "Service created successfully", service })
            } catch (error) {
                if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
                    console.log(chalk.bgRedBright("A service with this name already exists"), error)
                    return res.status(409).json({ message: "A service with this name already exists" })
                }
                throw error
            }
        })
    } catch (err) {
        console.log(chalk.bgRedBright("Failed to add service"), err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const updateService = async (req, res) => {
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

            const { name, description } = req.body;

            const existingService = await prismaClient.serviceType.findUnique({
                where: { id: id },
            });

            if (!existingService) {
                return res.status(404).json({ message: 'Service not found' });
            }

            const updateData = {
                name: name || existingService.name,
                description: description || existingService.description,
            };

            if (req.file) {
                updateData.background_img = `/serviceimages/${req.file.filename}`;
                // Optionally delete the old file if needed
                const oldFilePath = path.join(__dirname, '..', '..', 'serviceimages', existingService.background_img.split('/serviceimages/')[1]);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            const updatedService = await prismaClient.serviceType.update({
                where: { id: id },
                data: updateData,
            });

            return res.status(200).json({ message: 'Service updated successfully', service: updatedService });
        });
    } catch (error) {
        console.error('Failed to update service', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const toggleServiceLiveStatus = async (req, res) => {
    const { id } = req.params;
    const { is_live } = req.body;
    console.log(req.body)
    if (typeof is_live !== 'boolean') {
        return res.status(400).json({ message: 'Invalid input' });
    }
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
        const service = await prismaClient.serviceType.update({
            where: { id },
            data: { is_live }
        });
        res.status(200).json({ message: `Service ${is_live ? 'activated' : 'deactivated'} successfully`, service });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getServices = async (req, res) => {
    try {
        const services = await prismaClient.serviceType.findMany({
            include: {
                Category: {
                    include: {
                        subCategories: true
                    }
                }
            }
        })

        return res.status(200).json({ message: "Fetched services successfully", services })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const deleteService = async (req, res) => {
    const adminId = req.user?.userId
    const { serviceId } = req.params
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

        const deletedService = await prismaClient.serviceType.delete({
            where: {
                id: serviceId
            }
        })

        console.log(deletedService)
        return res.status(200).json({ message: 'Deleted service successfully', deleted: deletedService })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    addService,
    getServices,
    updateService,
    deleteService,
    toggleServiceLiveStatus
}