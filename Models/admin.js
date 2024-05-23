const mongoose = require('mongoose')
const adminschema =new  mongoose.Schema({
    email:{
        type:String,
        unique:true
    },
    password: {
        type:String
    }
})
const admin = mongoose.model("admindata",adminschema)
module.exports=admin
