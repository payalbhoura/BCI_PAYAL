const mongoose = require('mongoose')

// module.exports.init = async ()=>{
//     await mongoose.connect("")mongodb+srv://payalbhourakatoch:UIztG0z6VH2dMfbf@cluster0.hd5sxdn.mongodb.net/bcimgmt?retryWrites=true&w=majority&appName=Cluster0
// }
// module.exports.init = async ()=>{
//     await mongoose.connect(process.env.DB_URL)
// }
async function init(){
    await mongoose.connect(process.env.DB_URL)
}
module.exports = {init}