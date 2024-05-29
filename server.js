// require('dotenv').config()
const donenv= require('dotenv')
donenv.config();
const express = require('express')
const app = express()
const session = require('express-session')
const mydb = require("./db/db")
const UserRoutes = require('./Routes/userRoutes')
const adminRoutes= require('./Routes/adminRoutes');
const path = require('path');

const {forgotpasswordpage,forgotpassword,changepasswordpage,changepassword}=require("./Controllers/UserControllers")


app.set("view engine","ejs")//dynamicallly engine setup

//middleware starts
app.use(express.static('./public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
//userdefined middleware
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
// Print All Requests which is received from the frontend 
app.use("/",(req,res,next)=>{
    console.log("Path=>",req.path)
    console.log("Method=>",req.method);
    console.log("Body=>",req.body);
    next();
})
//check login middleware
function checkLoggedIn(req, res, next) {
    const publicRoutes = ['/login', '/signup'];
    if (!req.session.isLoggedIn && !publicRoutes.includes(req.path)) {
        return res.redirect("/login");
    }
    next();
}

function isAdmin(req, res, next) {
    console.log("Object:", req.path);
    console.log("Original URL:", req.originalUrl);

    // Allow access to the admin login page without checks
    if (req.originalUrl === '/admin/login') {
        return next();
    }

    // Check if the user is logged in
    if (!req.session.isLoggedIn) {
        // If not logged in and trying to access admin route, redirect to admin login
        return res.redirect("/admin/login");
    }

    // Check if the logged-in user has an admin role
    if (req.session.role !== 'admin') {
        return res.render("message/unauthorized");
    }

    next();
}



app.get("/forgotpassword",forgotpasswordpage)
app.post("/forgotpassword",forgotpassword)


app.get('/changepassword/:token',changepasswordpage)
app.post('/changepassword',changepassword)


app.use('/admin', isAdmin, adminRoutes);

app.use("/",checkLoggedIn,UserRoutes);// 
//middleware end

//server start firstle check the db is connected or not

mydb.init()//
.then(()=>{
    console.log("Db connected");
    app.listen(process.env.PORT||8000,(err)=>{
        console.log("Server is running on Port 8000");
    })
})
.catch(err=>console.log(err))
