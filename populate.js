require('dotenv/config')
const mongoose = require('mongoose')
const Product = require('./models/products')
const jsonProducts = require('./products.json')

mongoose.connect(process.env.DB_CONNECTION)
    .then(() => {
        //Product.deleteMany()
        Product.create(jsonProducts)
            //process.exit(0)
    }).catch(err => {
        console.log(err.message)
            //process.exit(1)
    })