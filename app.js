const express = require('express')
const app = express()
const cors = require('cors')
const corsConfig = {
    origin: '*',
    credential: true,
    methods: ["GET, POST", "PUT", "DELETE"],
}
app.options("", cors(corsConfig))
app.use(cors(corsConfig))
require("dotenv").config()
const path = require('path')
const productModel = require('./models/product')
const userModel = require('./models/user')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = require('./models/user')

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/createUser", (req, res) => {
    res.render("createUser")
})

app.get("/read", async (req, res) => {
    let allProduct = await productModel.find()
    res.render("read", { product: allProduct })
})

app.post("/create", async (req, res) => {
    let createdProduct = await productModel.create({
        name: req.body.name,
        company: req.body.company,
        price: req.body.price
    })
    res.send(createdProduct)
})

app.post("/createUser", (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                name: req.body.name,
                email: req.body.email,
                password: hash
            })

            let token = jwt.sign({email: req.body.email, userid: user._id}, "shhhhhh")
            res.cookie("token", token)
            res.send(createdUser)
        })
    })
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", async (req, res) => {
    let user = await userModel.findOne({email: req.body.email})
    if(!user){
        res.send("Something went wrong")
    }
    bcrypt.compare(req.body.password, user.password, function(err, result) {
        if(result) {
            let token = jwt.sign({email: user.email}, "shhhhhh")
            res.cookie("token", token)
            res.send("Login successfull")
        }
        else{
            res.send("Something is wrong")
        }
    })
})

app.get("/logout", (req, res) => {
    res.cookie("token", "")
    res.redirect("/createUser")
})

function isLoggedIn(req, res, next) {
    if(req.cookie.token) {
        res.send("you must be logged in")
    }
    else{
        let data = jwt.verify(req.cookie.token, "shhhhhh")
        req.user = data
        next()
    }
}

app.listen(process.env.PORT)