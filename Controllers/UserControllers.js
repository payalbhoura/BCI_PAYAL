const Product = require('../Models/productModel')
const Bill = require('../Models/bill')
const path = require('path')
const User = require('../Models/user')
const helper = require("../utils/helper")
const DailyReport = require('../Models/dailyReports')
const nodemailer = require("nodemailer")
const fs=require('fs')
const { generateResetToken,verifyResetToken } = require('../utils/jwtUtils');


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MYEMAIL,
        pass: process.env.Nodemailer_Password
    }
});


function getHomePage(req, res) {
    res.render("user/home", { user: { name: req.session.userName, store: req.session.store, profileUrl: req.session.profileUrl } })
}


function loadAddProduct(req, res) {
    res.render("user/additems", { user: { name: req.session.userName, store: req.session.store, profileUrl: req.session.profileUrl } })
}

function getLoginPage(req, res) {
    res.render("user/login", { err: null })
}

async function getBillPage(req, res) {
    let invNo = await generateInvoiceNumber(req)
    const items = await Product.find(
        { shopKeeperId: req.session.userId }, 
        'name'
    );
        const user = {
        name: req.session.userName,
        mobile: req.session.mobile,
        mail: req.session.email,
        gst: req.session.gst,
        pan: req.session.pan,
        store: req.session.store,
        invoiceNo: invNo,
        invoiceDate: new Date().toLocaleDateString(),
        address: req.session.address
    }
    res.render("user/generatebill", { user: user, items:items })
}

function getSignupPage(req, res) {
    res.render("user/signup")
}

function logoutUser(req, res) {
    req.session.destroy()
    res.redirect("/login")
}

async function addProductToCatalogue(req, res) {
    req.body.shopKeeperId = req.session.userId
    Product.create(req.body)
        .then(async (result) => {
            if (result) {
                const newObj = {
                    ...result._doc,
                    shopKeeperId: req.session.userId,
                    date: req.body.date,
                    consignor: req.body.consignor,
                    consignee: req.session.store,
                    invoice: req.body.invoice,
                    inward: req.body.stock
                }
                console.log("59", newObj);
                try {
                    const r = await inwardTansact(newObj)
                } catch (error) {
                    console.log("56", error);
                }
                res.status(200).json(result)
            }
        }).catch((err) => {
            res.status(500).send(err)
        });
}

function getCatalogue(req, res) {
    Product.find({ shopKeeperId: req.session.userId })
        .then((result) => {
            res.json(result)
        }).catch((err) => {
            console.log(err);
        });
}

function deleteProduct(req, res) {
    Product.deleteOne({ _id: req.body.id })
        .then((result) => {
            console.log(result);
            if (result.deletedCount > 0) {
                res.status(200).end()
            } else {
                res.status(404).end()
            }
        }).catch((err) => {
            res.status(500).send(err)
        });
}

async function modifyProduct(req, res) {
    const id = req.body.id
    delete req.body.id
    const stock = req.query.stock
    console.log("edit product");
    Product.findOneAndUpdate({ _id: id }, req.body, { new: true })
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err)
        });
}

async function updateStock(req, res) {
    const id = req.body.id
    const stock = req.body.stock
    console.log("update stock");
    Product.findOneAndUpdate({ _id: id }, { "$inc": { stock: stock } }, { new: true })
        .then(async (result) => {
            const newObj = {
                ...result._doc,
                shopKeeperId: req.session.userId,
                date: req.body.date,
                inward: stock,
                invoice: req.body.invoice,
                consignor: req.body.consignor,
                consignee: req.session.store
            }
            console.log("122", newObj);
            const r = await inwardTansact(newObj)
            console.log(r);
            res.status(200).json(result)
            return
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err)
            return
        });
}

async function generateInvoiceNumber(req) {
    let count = await Bill.countDocuments({ shopKeeperId: req.session.userId })
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const result = `${year}${month}${String(count + 1).padStart(3, '0')}`;
    return result;
}

async function saveBill(req, res) {
    req.body.shopKeeperId = req.session.userId
    const consignee = req.body.billDetails.recepientName
    const state = req.body.billDetails.recepientState || ""
    const date = req.body.billDetails.invoiceDate
    const invoice = req.body.billDetails.invoiceNumber
    try {
        const d2 = await decreaseStock(req.body.billItems)
        const newArr = req.body.billItems.map((i, index) => {
            return {
                ...i,
                _id: i.id,
                userId: req.session.userId,
                consignor: req.session.store,
                consignee: consignee,
                state: state,
                date: date,
                shopKeeperId: req.session.userId,
                stock: d2[index].stock,
                outward: i.quantity,
                invoice: invoice
            }
        })
        const rslt = outwardTransact(newArr)
        console.log(rslt);
    } catch (error) {
        console.log(error);
    }
    req.body.billDetails.invoiceDate = new Date(date).toLocaleDateString()
    Bill.create(req.body)
        .then((result) => {
            res.status(200).end()
        }).catch((err) => {
            res.status(500).send(err)
        });
}

function outwardTransact(productArray) {
    return new Promise(async (resolve, reject) => {
        try {
            for (let i = 0; i <= productArray.length; i++) {
                if (i == productArray.length) {
                    resolve("done tranasaction")
                }
                try {
                    const product = productArray[i]
                    const date = new Date(product.date).toLocaleDateString();
                    const month = new Date(product.date).getMonth() + 1;
                    const year = new Date(product.date).getFullYear();
                    let report = await DailyReport.findOne({ date: date })
                    if (!report) {
                        const reportItem = {
                            year: year,
                            month: month,
                            date: date,
                            stockDetails: [],
                            shopKeeperId: product.userId
                        }
                        report = await DailyReport.create(reportItem)
                    }
                    const productIndex = report.stockDetails.findIndex(item => item._id.equals(product._id) && item.type == "outward" && item.invoice == product.invoice)
                    // const stockFromDb = await Product.findOne({ _id: product._id })
                    if (productIndex == -1) {
                        const item = {
                            _id: product._id,
                            date: date,
                            name: product.name,
                            consignor: product.consignor,
                            consignee: product.consignee,
                            dispatchState: product.state || "NA",
                            invNo: product.invoice || "",
                            inwardStock: 0,
                            boxes: parseInt(Number(product.outward) / 6),
                            outwardStock: product.outward,
                            stockBalance: product.stock,
                            sales: 0,
                            transactType: "outward"
                        }
                        report.stockDetails.push(item)
                    } else {
                        report.stockDetails[productIndex].outwardStock += Number(product.outward)
                        report.stockDetails[productIndex].outward += parseInt(Number(product.outward) / 6)
                        report.stockDetails[productIndex].stockBalance -= Number(product.outward)
                    }
                    await report.save()
                    console.log("kaam khtm " + i + 1);
                } catch (error) {
                    console.log(error);
                    reject(error)
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

function decreaseStock(arr) {
    return new Promise(async (resolve, reject) => {
        let res = []
        for (let i = 0; i <= arr.length; i++) {
            try {
                if (i == arr.length) {
                    resolve(res)
                }
                const r = await Product.findOneAndUpdate({ _id: arr[i].id }, { "$inc": { stock: -arr[i].quantity } }, { new: true })
                res.push(r._doc)
            } catch (error) {
                reject(error)
            }
        }
    })
}

function inwardTansact(product) {
    return new Promise(async (resolve, reject) => {
        try {
            const date = new Date(product.date).toLocaleDateString();
            const month = new Date(product.date).getMonth() + 1;
            const year = new Date(product.date).getFullYear();
            let report = await DailyReport.findOne({ shopKeeperId: product.shopKeeperId, date: date })
            if (!report) {
                const reportItem = {
                    year: year,
                    month: month,
                    date: date,
                    stockDetails: [],
                    shopKeeperId: product.shopKeeperId
                }
                report = await DailyReport.create(reportItem)
            }
            const productIndex = report.stockDetails.findIndex(item => item._id.equals(product._id) && item.invNo === product.invoice && item.type == "inward")
            // const stockFromDb = await Product.findOne({ _id: product._id })
            if (productIndex == -1) {
                const item = {
                    _id: product._id,
                    date: date,
                    name: product.name,
                    consignor: product.consignor,
                    consignee: product.consignee,
                    dispatchState: product.state || "NA",
                    invNo: product.invoice,
                    inwardStock: Number(product.inward),
                    boxes: parseInt(Number(product.inward) / 6),
                    outwardStock: 0,
                    stockBalance: product.stock,
                    sales: 0,
                    transactType: "inward"
                }

                report.stockDetails.push(item)
            } else {
                report.stockDetails[productIndex].inwardStock += Number(product.inward)
                report.stockDetails[productIndex].boxes += parseInt(Number(product.inward) / 6)
                report.stockDetails[productIndex].stockBalance += Number(product.inward)
            }
            await report.save()
            console.log("kaam khtm");
            resolve(true)
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })
}

function getBill(req, res) {
    const user = {
        name: req.session.userName,
        mobile: req.session.mobile,
        mail: req.session.email,
        gst: req.session.gst,
        pan: req.session.pan,
        store: req.session.store,
        address: req.session.address
    }
    res.render("user/billhistory", { user: user })
}

function createUser(req, res) {
    console.log("file", req?.file);
    console.log();
    const user = {
        ...req.body,
        profileUrl: "uploads\\" + req.file.filename
    }
    console.log(user);
    User.create(user)
        .then((result) => {
            const mailOption = {
                from: process.env.MYEMAIL,
                to: req.body.email,
                subject: "Regarding about the inventory system",
                html: `
                <html>
                <body>
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">Welcome to the Inventory System!</h2>
                <p>Dear User,</p>
                <p>We are excited to inform you that your sign-up was successful. Now, please wait for the admin to approve your request. This process may take some time, so we appreciate your patience.</p>
                <p>While you wait, please ensure that you have provided accurate information during registration. Double-check your details to ensure smooth processing.</p>
                <p>If you have any urgent inquiries or need assistance, feel free to contact our support team at <a href="mailto:support@inventorysystem.com">support@inventorysystem.com</a>.</p>
                <p>Good luck, and thank you for registering with us!</p>
                <p>Best regards,</p>
                <p>ADMIN: PAYAL KATOCH</p>
                <p>The Inventory System Team</p>
               </div>
               </body>
               </html>`
            };
            transporter.sendMail(mailOption, (error, info) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("email send", info.response);
                }
            })
            res.status(302).end();
        }).catch((err) => {
            if (err.code === 11000) {
                res.status(403).send("email already exists")
            } else {
                res.status(500).send(err)
            }
        });
}

function loginUser(req, res) {
    console.log(req.body);
    User.findOne({ email: req.body.email, password: req.body.password })
        .then((result) => {
            if (result === null) {
                res.status(404).send("User Not found")
            } else if (!result.approved) {
                res.status(403).end()
            } else {
                console.log(result.address);
                setSession(req, result)
                delete result.password
                res.status(200).json(result)
            }
        }).catch((err) => {
            res.status(500).send(err)
        });
}

function getAllBills(req, res) {
    Bill.find({ shopKeeperId: req.session.userId })
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err)
        });
}

function bulkUpload(req, res) {

}

function forgotpasswordpage(req, res) {
    res.render("message/mail/forgetpassword");
}

const ejs= require('ejs')

function forgotpassword(req, res) {
    const email = req.body.email;
    const token = generateResetToken(email);
    const resetUrl = `http://localhost:8000/changepassword/${token}`;

    const filePath = path.join(__dirname, '../views/message/mail/changepassword.ejs');

    ejs.renderFile(filePath, { resetUrl: resetUrl }, (err, htmlcontent) => {
        if (err) {
            console.error("Error rendering EJS template:", err);
            return res.status(500).json({ message: 'Error generating email content' });
        }

        const mailOption = {
            from: process.env.MYEMAIL,
            to: email,
            subject: "Regarding the inventory system || CHANGE PASSWORD",
            html: htmlcontent
        };

        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Error sending email' });
            } else {
                console.log("Email sent", info.response);
                return res.status(200).json({ message: 'Password reset link sent to your email' });
            }
        });
    });
}



    async function getReports(req, res) {
        try {
            const month = req.query.month
            const year = req.query.year
            const search = {
                shopKeeperId: req.session.userId
            }
            if (month && year) {
                search.month = month
                search.year = year
            } else {
                search.month = new Date().getMonth() + 1
            }
            const reports = await DailyReport.find(search);
            console.log("reports", reports);
            if (reports.length <= 0) {
                res.status(200).json([])
            } else {
                const arrOfArrs = reports.map(r => r.stockDetails)
                console.log(arrOfArrs);
                let result = []
                await arrOfArrs.forEach(element => {
                    element.forEach(e => result.push(e))
                });
                res.status(200).json(result)
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error)
        }
    }

    function changepasswordpage(req,res){
            const { token } = req.params;
            const decoded = verifyResetToken(token);
        
            if (!decoded) {
                return res.status(400).send('Invalid or expired token');
            }
            res.render("message/changepassword",{ token })
    }

    const changepassword=async (req, res) => {
        const { token, password } = req.body;
        const decoded = verifyResetToken(token);
        console.log("decoded",decoded)
    
        if (!decoded) {
            return res.status(400).send('Invalid or expired token');
        }
    
        try {    
            const updateResult = await User.updateOne(
                { email: decoded.email },
                { $set: { password: password } }
            );
    
            if (updateResult.nModified === 0) {
                return res.status(404).send('User not found or password not updated');
            }
    
            res.send('Password has been reset successfully');
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).send('Internal server error');
        }
    }
    function setSession(req, user) {
        req.session.isLoggedIn = true
        req.session.userName = user.name
        req.session.userId = user._id
        req.session.gst = user.gst
        req.session.pan = user.pan
        req.session.email = user.email
        req.session.mobile = user.mobile
        req.session.store = user.store
        req.session.address = user.address
        req.session.profileUrl = user.profileUrl
        req.session.role = "user";
    }

    module.exports = {
        getHomePage,
        loadAddProduct,
        getBill,
        getLoginPage,
        addProductToCatalogue,
        getCatalogue,
        deleteProduct,
        modifyProduct,
        updateStock,
        getBillPage,
        saveBill,
        getSignupPage,
        createUser,
        loginUser,
        logoutUser,
        getAllBills,
        getReports,
        forgotpasswordpage,
        forgotpassword,
        changepasswordpage,
        changepassword

    }