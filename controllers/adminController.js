const adminModel=require('../models/adminModel')
const userModel=require('../models/userModel')
const orderModel=require('../models/orderModel')
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "dtevxccbm",
  api_key: "179654333255418",
  api_secret: "_2AEQkePyB2iFgSu1YsonwJ_kCk",
});


module.exports={

adminLogin:(req,res)=>{
    if(req.session.admin){
        res.redirect("/admin/")
    }else{
        res.render('adminLogin', {err:false})
    }
},
adminHome:async (req, res) => {
  try {
    if (req.session.admin) {
      const order = await orderModel.find().lean();
      const monthlyDataArray = await orderModel.aggregate([
        { $match: { paid: true } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            sum: { $sum: "$totalPrice" },
          },
        },
      ]);

      const monthlyReturnArray=await orderModel.aggregate([{$match:{orderStatus:'returned'}},{$group:{_id:{$month:'$createdAt'},sum:{$sum:'$totalPrice'}}}])
         
      let deliveredOrder = 0;
      let PendingOrder = 0;
      let cancelOrder = 0;
      let returnOrder=0;


      const user = await userModel.find().lean();

      let users = user.length;
      let totalOrders = order.length;
      let totalRevenue = 0;

      let deliveredOrders = order.filter((item) => {
        if (item.status == "pending") {
          PendingOrder++;
        }

        if (item.status == "cancelled") {
          cancelOrder++;
        }
        if(item.orderStatus=='returned'){
          returnOrder++
        }

        if (item.status == "delivered") {
          deliveredOrder++;
          totalRevenue = totalRevenue + item.totalPrice;
        }

        return item.paid;
      });

      let totalDispatch = deliveredOrders.length;

      let monthlyDataObject = {};

      monthlyDataArray.map((item) => {
        monthlyDataObject[item._id] = item.sum;
      });

      let monthlyData = [];
      for (let i = 1; i <= 12; i++) {
        monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
      }

      res.render("adminHome", {
        totalOrders,
        users,
        totalRevenue,
        monthlyData,
        deliveredOrder,
        PendingOrder,
        cancelOrder,
        returnOrder,
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (err) {
    console.log("ful ercancelr");
    console.log(err);
  }
},

postAdminlogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await adminModel.findOne({ email });

      
      if (admin) {
        if (password == admin.password) {
         
          req.session.admin = {
            email:admin.email
          };

 
          res.redirect("/admin/");
        } else {
          
          res.render("adminLogin", { err:true,  message:"Incorrect Password" });
        }
      } else {
        
        res.render("adminLogin", { err:true, message:"Please Enter all fields" });
      }
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
},
adminLogout: (req, res) => {
    req.session.admin = null;
    res.redirect("/admin/login");
},
 
  getuserManagment:async (req, res) => {
    try {

      let users = await userModel.find({}, { password: 0 }).lean();

      res.render("userManagment", { users });
    } catch (err){
      console.log("ful err");
      console.log(err);
    }
  },
  getuserBlock: async (req, res) => {
    try {
      var id = req.params.id;

      await userModel
        .findByIdAndUpdate(id, { $set: { status: "block" } })
        .then(() => {
          res.redirect("/admin/user-managment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },
  getuserUnlock: async (req, res) => {
    try {
      var id = req.params.id;

      await userModel
        .findByIdAndUpdate(id, { $set: { status: "Unblock" } })
        .then(() => {
          res.redirect("/admin/user-managment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
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
  adminReturnedOrder:async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "returned" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  }
}