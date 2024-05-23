const UserRoutes = require('express')()
const User = require('../Models/user')
const {getHomePage,
     loadAddProduct,
     getLoginPage,
     addProductToCatalogue,
     getCatalogue,
     deleteProduct,
     modifyProduct,
     updateStock,
     getBillPage,
     saveBill,
     getBill,
     getSignupPage,
     createUser,
     loginUser,
     logoutUser,
     getAllBills,
     getReports,
    } = require('../Controllers/UserControllers')
const upload = require('../utils/multer'); // Path to your multer config


UserRoutes.get("/",getHomePage)

UserRoutes.get("/home",getHomePage)

UserRoutes.route("/signup")
.get(getSignupPage)
.post(upload.single('img'),createUser)

UserRoutes.route("/login")
.get(getLoginPage)
.post(loginUser)

UserRoutes.get("/logout",logoutUser)

UserRoutes.route("/addproducts")
.get(loadAddProduct)
.post(addProductToCatalogue)
.delete(deleteProduct)
.patch(updateStock)
.put(modifyProduct)

UserRoutes.get("/billhistory",getBill)

UserRoutes.get("/getbillhistory",getAllBills)

UserRoutes.route("/generatebill")
.get(getBillPage)
.post(saveBill)

UserRoutes.get("/getCatalogue",getCatalogue)

UserRoutes.get("/reports",getReports)

module.exports = UserRoutes