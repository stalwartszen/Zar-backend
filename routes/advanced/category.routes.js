const { addCategory, getCategoryByParentName, getCategoryTree } = require('../../controllers/advanced/cms/category')
const authenticateToken = require('../../middlewares/Auth.middleware')


const router = require('express').Router()

router.post('/admin/addCategory',authenticateToken,addCategory)
router.get('/admin/categories', authenticateToken, getCategoryByParentName)

router.get('/categories', getCategoryTree)

module.exports = router