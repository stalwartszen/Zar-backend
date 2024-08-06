const { addCategory } = require('../../controllers/cms/category.controllers')
const { addService } = require('../../controllers/cms/services.controllers')
const { addSubCategory } = require('../../controllers/cms/subcategory.controllers')


const router = require('express').Router()

router.post('/addService', addService)




router.post('/addCategory', addCategory)




router.post('/addSubCategory', addSubCategory)


module.exports = router