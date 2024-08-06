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
    try {
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
                const subcategory = await prismaClient.serviceType.create({
                    data: {
                        name,
                        background_img: `/subcategoryimages/${filename}`,
                        description
                    }
                })
                return res.status(201).json({ message: "Sub-Category created successfully", subcategory })
            } catch (error) {
                if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
                    console.log(chalk.bgRedBright("A sub-category with this name already exists"), error)
                    return res.status(409).json({ message: "A sub-category with this name already exists" })
                }
                throw error
            }
        })
    } catch (err) {
        console.log(chalk.bgRedBright("Failed to add sub-category"), err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    addSubCategory
}