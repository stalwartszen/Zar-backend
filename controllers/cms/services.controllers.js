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
    try {
        upload.single('background_img')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: "File upload error" })
            } else if (err) {
                return res.status(500).json({ message: "Internal server error" })
            }

            const { name, description } = req.body

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

module.exports = {
    addService
}