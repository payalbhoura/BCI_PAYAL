const admin = require("../Models/admin")
const User = require('../Models/user')
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MYEMAIL,
        pass: process.env.Nodemailer_Password
    }
});






function getadminloginpage(req, res) {
    res.render("admin/login");
}

async function loginadmin(req, res) {
    try {
        const admindata = req.body;
        const resp = await admin.findOne({ email: admindata.email })
        
        console.log(resp);
        if (!resp) {
            res.status(403).json({ msg: "You are not admin" })
        }
        if (resp?.password != admindata?.password) {
            res.status(401).json({ msg: "Password Incorrect" })
        }
        else {
            setSession(req,resp)
            res.status(200).redirect("/admin/home")
        }
    } catch (error) {

    }
}

function setSession(req, user) {
    req.session.isLoggedIn = true
    req.session.userName = user.name
    req.session.userId = user._id
    req.session.role="admin"
}

async function getAdminPage(req, res) {
    const usersRes = await User.find({ $and: [{ approved: false }, { rejected: false }] })
    console.log(usersRes);
    const users = usersRes.map(u => {
        return {
            id: u._id,
            name: u.name,
            email: u.email,
            address:u.address,
            city:u.city,
            state:u.state,
            pincode:u.pincode,
            pan:u.pan,
            aprroved: u.approved,


        }
    })
    res.render("admin/home", { users });
}

async function getuserhistorypage(req, res) {
    const users = await User.find({ $or: [{ approved: true }, { rejected: true }] });

    console.log(users);

    const user = users.map(u => {
        return {
            id: u._id,
            name: u.name,
            email: u.email,
            // status: (()=>{
            //     if(u.approved==1)
            //         return "approved"
            //     else if (u.rejected)
            //         return "rejected"
            // })()
            approved: u.approved,
            rejected: u.rejected
        }
    })
    res.render("admin/userhistory", { users: user })
}

async function approveduser(req, res) {
    try {
        const _id = req.query.id;
        const user = await User.findOneAndUpdate({ _id }, { approved: true })
        console.log(user);
        if (user) {
            const mailOption = {
                from: process.env.MYEMAIL,
                to: user.email,
                subject: "Regarding about your inventory system",
                html: `
                <html>
                <body>
                    <h1>Congratulations!</h1>
                    <p>Your request has been approved. You have successfully used the Billing cum Inventory system regarding your stocks.</p>
                    <p>Thank you for using our service. We hope to serve you again in the future.</p>
                    <p>Best regards,<br>PAYAL KATOCH</p>
                </body>
                </html>
                `
            };

            transporter.sendMail(mailOption, (error, info) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("email send", info.response);
                }
            })
            res.status(200).end();
        }
    } catch (error) {
        console.log(err);
        res.status(500).end();
    }

}
async function rejecteduser(req, res) {
    try {
        const _id = req.query.id;
        const user = await User.findOneAndUpdate({ _id }, { rejected: true })
        console.log(user);
        if (user) {
            const mailOption = {
                from: process.env.MYEMAIL,
                to: user.email,
                subject: "Regarding about your inventory system",
                html:` 
                <html>
                <body>
                    <h1>Notification</h1>
                    <p>We regret to inform you that your request has been rejected. Unfortunately, you were unable to use the Billing cum Inventory system regarding your stocks at this time.</p>
                    <p>Thank you for your understanding. Please feel free to contact us if you have any questions or need further assistance.</p>
                    <p>Best regards,<br>PAYAL KATOCH</p>
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

            res.status(200).end();
        }
    } catch (error) {
        console.log(err);
        res.status(500).end();
    }

}

module.exports = {
    rejecteduser,
    approveduser,
    getadminloginpage,
    getAdminPage,
    loginadmin,
    getuserhistorypage
}
