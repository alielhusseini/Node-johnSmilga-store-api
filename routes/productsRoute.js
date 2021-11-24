const { Router } = require('express')
const productsController = require('../controllers/productsController')

const router = Router()

router.route('/').get(productsController.getAllProducts)
router.route('/static').get(productsController.getAllProductsStatic)

module.exports = router