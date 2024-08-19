const { getUsers, getMaterialUsers, getServiceUsers } = require('../../controllers/admin/users.controllers')
const authenticateToken = require('../../middlewares/Auth.middleware')

const router = require('express').Router()

router.get('/getUsers', authenticateToken, getUsers)
router.get('/material/users', authenticateToken, getMaterialUsers)
router.get('/service/users', authenticateToken, getServiceUsers)


module.exports = router