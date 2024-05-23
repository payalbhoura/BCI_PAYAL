const routes = require('express')()
const model =require("../Models/admin")
const {
    loginadmin,
    getAdminPage,
    getadminloginpage,
    getuserhistorypage,
    rejecteduser,
    approveduser,
   
}=require("../Controllers/admin Controllers")

routes.get("/home",getAdminPage)

routes.get("/userhistory",getuserhistorypage)

routes.put("/user/approved",approveduser)

routes.put("/user/rejected",rejecteduser)

routes.get("/login",getadminloginpage)
routes.post("/login",loginadmin)

module.exports=routes