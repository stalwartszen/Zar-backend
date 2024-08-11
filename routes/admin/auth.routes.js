const { registerAdmin, loginAdmin, giveAccessToUser } = require('../../controllers/admin/auth.controllers')
const authenticateToken = require('../../middlewares/Auth.middleware')

const router = require('express').Router()

router.post('/register', registerAdmin)
router.post('/login',loginAdmin)
router.post('/giveAccess', authenticateToken, giveAccessToUser)

module.exports = router

