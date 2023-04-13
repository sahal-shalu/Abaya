const orderModel=require('../models/orderModel');
const userModel = require('../models/userModel');
const userController = require('./userController');
module.exports={

  orderManagment: async (req, res) => {
    try {
      const order = await orderModel.find().lean();
      res.render("orderManagment", { order });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  adminOrderView: async (req, res) => {
  
    try {
      const id = req.params.id;

      const order = await orderModel.findById({ _id: id }).lean();

      res.render("adminViewOrder", { order });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  admincancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "cancelled" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  adminPendingOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "pending" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  AdminShipOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "shiped" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  adminDeliveredOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "delivered" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
 

adminRetrunProgressingOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "return-progressing" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  adminReturnOrder:async(req,res)=>{
    try{
  const orderId=req.params.id;


  const order = await orderModel.findOne({_id:orderId}).lean()

  await orderModel.
  updateOne({_id:orderId},{$set:{status:'Returned'}}).lean()

  await userModel.updateOne({ _id: order.userId }, { $inc: { wallet: order.totalPrice } })
  res.redirect('back')


    }catch(err){
   console.log(err)
    }
  },
  getOrders: async (req, res) => {
    try {
      const order = await orderModel.find({}).sort({dateOrdered:-1}).lean();
      console.log(order);
      let empty; 
      order.length == 0 ? (empty = true) : (empty = false);
      res.render("orders", { order, empty });
    } catch (err) {
      res.render('404')
      console.log(err);
    }
  },
  getviewOrder: async (req, res) => {
    try {
      const id = req.params.id;

      const order = await orderModel.findById({ _id: id }).lean();
      

      res.render("viewOrder", { order });
    } catch (err) {
      res.render('404')
      console.log(err);
    }
  },
  cancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne(
          { _id: orderId },
          { $set: { status: "cancelled", cancel: true } }
        )
        .lean();

      res.redirect("back");
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },
  returnOrder: async (req, res) => {
    const id = req.session.user.id
    const _id = req.params.id
    const user = await userModel.findOne({ _id: id }).lean()

    console.log(user)

    const order = await orderModel.findOne({ _id }).lean()

    await orderModel.updateOne({ _id }, {
        $set: {
            status: 'return-progressing'
        }
    })

    res.redirect('back')
},


  // adminReturnprogressingOrder:async(req,res)=>{
  //   try{
  //     const orderId=req.params.id;
  //     const order=await orderModel.updateOne({_id:orderId},{$set:{status:'return-progressing'}}).lean();
  //     res.redirect('back')
  //   }catch(err){
  //     console.log('return-progressing error')
  //     console.log(err)
  //   }
  // },
  // adminReturnOrder:async(req,res)=>{
  //   try{
  //     const orderId=req.params.id;
  //     const order=await orderModel.updateOne({_id:orderId},{$set:{status:'returned'}}).lean();
  //     res.redirect('back')
  //     await userModel.updateOne({_id:order.userId},{$inc:{waller:order.totalPrice}})

  //   }catch(err){
  //  console.log('return error')
  //  console.log(err)
  //   }
  // },
  // UpdateOrderStatus:async(req,res)=>{
    //   const status=req.body.status
    //   const objectId=req.params.id
    //   try{
      //     const order=await order.findById(objectId)
  //     if(status=='delivered'){
  //       order.paid=true;
  //       order.dateDelivered=formatteDate(new Date());
  //       order.lastDate=Date.now() + 259200000;
  //       order.amountToPay=0;
  //     }
  // if(status=='return'){
  //   await User.updateOne(
  //     {_id:order.userId},
  //     {$inc:{wallet:order.totalPrice}}
  //   );
  // }
  // order.status=status;
  // await order.save();
  // res.redirect('/admin/orderManagment')

  //   }
  //   catch(error){
  //     res.render('404')
  //     res.send(error)
  //   }
  // }
  getsingleOrder: async (req, res) => {
    const _id = req.params.id;

    const order = await orderModel.findById({ _id }).lean();

    res.render("singleOrder", { order });
  },
}