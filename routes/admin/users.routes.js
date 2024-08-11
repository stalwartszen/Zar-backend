const { getUsers } = require('../../controllers/admin/users.controllers')
const authenticateToken = require('../../middlewares/Auth.middleware')

const router = require('express').Router()

router.get('/getUsers', authenticateToken, getUsers)


module.exports = router