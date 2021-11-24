require('dotenv/config')
require('express-async-errors')
const express = require('express')
const mongoose = require('mongoose')

const app = express()
mongoose.connect(process.env.DB_CONNECTION).then(() => app.listen(process.env.PORT)).catch(err => console.log(err.message))
app.use(express.json())

app.get('/', (req, res) => res.send('<h1><a href="/api/v1/products">products route</a></h1>'))
app.use('/api/v1/products', require('./routes/productsRoute'))
app.use(require('./middlewares/not-found'));
app.use(require('./middlewares/error-handler'));