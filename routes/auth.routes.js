const { registerUser, loginUser, setPassword, verifyUser, getProfile, getServiceUsersById, updateUser, getMaterialUsersById, getHomeOwnerUsersById } = require('../controllers/common/auth.controllers')
const authenticateToken = require('../middlewares/Auth.middleware')

const router = require('express').Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/setPassword',authenticateToken, setPassword)
router.post('/verifyUser', verifyUser)
router.get('/profile', authenticateToken, getProfile)
router.get('/service/:suid', authenticateToken, getServiceUsersById)
router.get('/material/:suid', authenticateToken, getMaterialUsersById)
router.get('/homeowner/:suid', authenticateToken, getHomeOwnerUsersById)
router.put('/user/:suid', authenticateToken, updateUser)


module.exports = router