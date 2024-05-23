const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true
    },
    password:String,
    gst:String,
    pan:String,
    mobile:String,
    store:String,
    approved:{
        type:Boolean,
        default:false
    },
    rejected:{
        type:Boolean,
        default:false
    },
    address:String,
    city:String,
    state:String,
    pincode:String,
    role:{
        type:String,
        default:"user"
    },
    profileUrl:String
})
const User = mongoose.model("users",userSchema)
module.exports = User