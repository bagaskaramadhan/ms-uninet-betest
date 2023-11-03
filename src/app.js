const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const router = require('./routes/index');
require('dotenv').config()

const app = express()
app.get('/', (req, res) => {
    res.send("Hello No API")
})

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use('/', router)
const URL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@ac-qkv6w95-shard-00-00.nzdbeml.mongodb.net:27017,ac-qkv6w95-shard-00-01.nzdbeml.mongodb.net:27017,ac-qkv6w95-shard-00-02.nzdbeml.mongodb.net:27017/${process.env.MONGO_DATABASE}?ssl=true&replicaSet=atlas-akbb1o-shard-0&authSource=admin&retryWrites=true&w=majority`
mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log(`Connected MongoDB`)
        app.listen(process.env.PORT, () => {
            console.log(`RUNNING ON ${process.env.PORT}`)
        })
    })
    .catch(err => console.log(err));