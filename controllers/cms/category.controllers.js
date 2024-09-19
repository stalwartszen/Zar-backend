const prisma = require('@prisma/client')
const chalk = require('chalk')
const prismaClient = new prisma.PrismaClient()
const path = require('path')
const fs = require('fs')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', '..', 'categoryimages')
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

const addCategory = async (req, res) => {
    const adminId = req.user?.userId
    try {
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: adminId,
                type: 'ADMIN'
            }
        });

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized user.. Only admin can access it." })
        }
        upload.single('background_img')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: "File upload error" })
            } else if (err) {
                return res.status(500).json({ message: "Internal server error" })
            }

            const { name, description, serviceId } = req.body

            if (!name || !description || !req.file || !serviceId) {
                console.log(chalk.bgYellow("Category creation params check failed"), req.body, req.file);
                return res.status(400).json({ message: 'name, background_img file, service type and description are required' });
            }

            const filename = req.file.filename

            try {
                const category = await prismaClient.category.create({
                    data: {
                        name,
                        background_img: `/categoryimages/${filename}`,
                        description,
                        serviceTypeId: serviceId
                    }
                })
                return res.status(201).json({ message: "Category created successfully", category })
            } catch (error) {
                if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
                    console.log(chalk.bgRedBright("A category with this name already exists"), error)
                    return res.status(409).json({ message: "A category with this name already exists" })
                }
                throw error
            }
        })
    } catch (err) {
        console.log(chalk.bgRedBright("Failed to add Category"), err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const updateCategory = async (req, res) => {
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

            const { name, description, serviceId } = req.body;

            const existingCategory = await prismaClient.category.findUnique({
                where: { id: id },
            });

            if (!existingCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }

            const updateData = {
                name: name || existingCategory.name,
                description: description || existingCategory.description,
                serviceTypeId: serviceId || existingCategory.serviceTypeId
            };

            if (req.file) {
                // Update the background_img path
                updateData.background_img = `/categoryimages/${req.file.filename}`;

                // Optionally delete the old file if needed
                const oldFileName = existingCategory.background_img.split('/categoryimages/')[1];
                
                if (oldFileName) {
                    const oldFilePath = path.join(__dirname, '..', '..', 'categoryimages', oldFileName);

                    // Ensure the old file exists before attempting to delete it
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
            }

            const updatedCategory = await prismaClient.category.update({
                where: { id: id },
                data: updateData,
            });

            return res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
        });
    } catch (error) {
        console.error('Failed to update Category', error);
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
//         const Category = await prismaClient.category.update({
//             where: { id },
//             data: { is_live }
//         });
//         res.status(200).json({ message: `Category ${is_live ? 'activated' : 'deactivated'} successfully`, Category });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };


const getCategory = async (req, res) => {
    const { serviceTypeName } = req.query; 
    console.log(serviceTypeName)
  
    try {
      const serviceType = await prismaClient.serviceType.findUnique({
        where: {
          name: serviceTypeName,
        },
        include: {
          Category: true, 
        },
      });
  
      if (!serviceType) {
        return res.status(404).json({ error: 'Service type not found' });
      }
  
      return res.status(200).json(serviceType.Category);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'An error occurred while fetching categories' });
    }
  };

  const getCategoryByServiceId = async (req, res) => {
    const { sid } = req.params; 
    console.log(sid, '000')
  
    try {
      const serviceType = await prismaClient.serviceType.findUnique({
        where: {
          name: sid,
        },
        include:{
            Node:{
                include :{
                    children: {
                        include : {
                            children : true
                        }
                    }
                }
            }
        }
      });

      console.log(serviceType)
  
      if (!serviceType) {
        return res.status(404).json({ error: 'Catgories type not found' });
      }
  
      return res.status(200).json({message: 'Fetched categories successfully', data: serviceType});
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'An error occurred while fetching categories' });
    }
  };

const deleteCategory = async (req, res) => {
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

        const deletedCategory = await prismaClient.category.delete({
            where: {
                id: categoryId
            }
        })

        console.log(deletedCategory)
        return res.status(200).json({ message: 'Deleted Category successfully', deleted: deletedCategory })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    addCategory,
    getCategory,
    getCategoryByServiceId,
    updateCategory,
    deleteCategory
}