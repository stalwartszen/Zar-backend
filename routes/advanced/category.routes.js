const { addCategory, getCategoryByParentName, getCategoryTree, addBranch, getRoots, getBranchById, getBranchTree, getLeaves, updateNode, deleteNode } = require('../../controllers/advanced/cms/category')
const authenticateToken = require('../../middlewares/Auth.middleware')


const router = require('express').Router()

router.post('/admin/root',authenticateToken,addCategory)
router.post('/admin/branch', authenticateToken, addBranch)
router.get('/roots', getRoots)
router.get('/admin/branch/:id', getBranchById)
router.get('/admin/branchtree/:id', getBranchTree)
router.get('/leaves', getLeaves)

router.put('/admin/branch/:id', authenticateToken, updateNode)
router.delete('/admin/branch/:id', authenticateToken, deleteNode)


module.exports = router