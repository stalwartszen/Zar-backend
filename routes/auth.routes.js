const { registerUser, loginUser, setPassword, verifyUser } = require('../controllers/common/auth.controllers')

const router = require('express').Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/setPassword', setPassword)
router.post('/verifyUser', verifyUser)

module.exports = router