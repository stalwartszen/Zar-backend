const { addCommunity, getAllCommunityPasscodes, getHomeownersByPasscode, generateAndCheckPasscode, addCommunityByName } = require('../../controllers/advanced/admin/community')
const authenticateToken = require('../../middlewares/Auth.middleware')


const router = require('express').Router()

router.post('/community/passcode', authenticateToken,addCommunity)
router.post('/community/passcode/byname', authenticateToken,addCommunityByName)
router.get('/communities', getAllCommunityPasscodes)
router.get('/community/homeowners', authenticateToken,getHomeownersByPasscode)
router.get('/community/uniquepasscode', authenticateToken, generateAndCheckPasscode)

module.exports = router