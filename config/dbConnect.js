const { MongoTopologyClosedError } = require('mongodb')
const mongoose=require('mongoose')
const { mainModule } = require('process')
const dbConnect=()=>{
    mongoose.set('strictQuery',true)
    mongoose.connect('mongodb+srv://sahalshalu:minnu5426@cluster0.vzrzb2t.mongodb.net/?retryWrites=true&w=majority')
    .then(()=>{
        console.log('connected')
    })
    .catch(err=>{
        console.log('error'+err)
    })
}
module.exports=dbConnect;