const express = require('express')
const app = express();
require('./models/config')
require('dotenv').config()
const bodyparser = require('body-parser')
const router = require('./router/mainRouter')

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use("/", router)
const server = app.listen(process.env.PORT,function(req,res){
    console.log(`Server is running on port no:${process.env.PORT}`);
})

module.exports = server