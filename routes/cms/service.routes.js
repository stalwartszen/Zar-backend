const { addCategory, getCategories, deleteCategory, getCategory, updateCategory, getCategoryByServiceId } = require('../../controllers/cms/category.controllers')
const { addService, getServices, deleteService, toggleServiceLiveStatus, updateService } = require('../../controllers/cms/services.controllers')
const { addSubCategory, updateSubCategory, getSubCategory, deleteSubCategory } = require('../../controllers/cms/subcategory.controllers')
const authenticateToken = require('../../middlewares/Auth.middleware')


const router = require('express').Router()

router.post('/services', authenticateToken, addService)
router.put('/services/:id', authenticateToken, updateService)
router.get('/services', getServices)
router.delete('/service/:serviceId', authenticateToken, deleteService)
router.put('/service/toggle-live/:id', authenticateToken, toggleServiceLiveStatus)


router.post('/category', authenticateToken, addCategory)
router.put('/category/:id', authenticateToken, updateCategory)
router.get('/categories', getCategory)
router.get('/categories/:sid', getCategoryByServiceId)
router.delete('/category/:categoryId', authenticateToken, deleteCategory)


router.post('/subcategory',authenticateToken, addSubCategory)
router.put('/subcategory/:id', authenticateToken, updateSubCategory)
router.get('/subcategories', getSubCategory)
router.delete('/subcategory/:categoryId', authenticateToken, deleteSubCategory)

module.exports = router