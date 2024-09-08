const { registerUser, loginUser, setPassword, verifyUser, getProfile } = require('../controllers/common/auth.controllers')
const authenticateToken = require('../middlewares/Auth.middleware')

const router = require('express').Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/setPassword',authenticateToken, setPassword)
router.post('/verifyUser', verifyUser)
router.get('/profile', authenticateToken, getProfile)

module.exports = router