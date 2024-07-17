const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/productsFrontend")

const productSchema = mongoose.Schema({
    name: String,
    company: String,
    price: Number
})

module.exports = mongoose.model('product', productSchema)