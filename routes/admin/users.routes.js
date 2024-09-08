const { getUsers, getMaterialUsers, getServiceUsers, sentPaymentLink, sentPasscodeToUser, getServiceUsersById, updateUser } = require('../../controllers/admin/users.controllers')
const authenticateToken = require('../../middlewares/Auth.middleware')

const router = require('express').Router()

router.get('/getUsers', authenticateToken, getUsers)
router.get('/material/users', authenticateToken, getMaterialUsers)
router.get('/service/users', authenticateToken, getServiceUsers)
router.put('/service/:id', authenticateToken, updateUser)
router.get('/service/:suid', authenticateToken, getServiceUsersById)



router.post('/sentPaymentLink' , authenticateToken, sentPaymentLink)
router.post('/sendPasscode' , authenticateToken , sentPasscodeToUser)

module.exports = router