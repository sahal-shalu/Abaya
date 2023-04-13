
const categoryModel=require('../models/categoryModel')
const couponModel=require('../models/couponModel')
const userModel=require('../models/userModel')
const productModel=require('../models/productModel')

module.exports={

  couponManagment: async (req, res) => {
    try {
      const coupons = await couponModel.find().lean();
      res.render("couponManagment", { coupons });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  getaddCoupon: (req, res) => {
    res.render("addCoupon");
  },
  unlistCoupon: async (req, res) => {
    try {
      const _id = req.params.id;
      await couponModel
        .findByIdAndUpdate(_id, { $set: { status: "unavailable" } })
        .then(() => {
        
          res.redirect("/admin/coupon-managment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  
  listCoupon: async (req, res) => {
    try {
      const _id = req.params.id;

      await couponModel
        .findByIdAndUpdate(_id, { $set: { status: "available" } })
        .then(() => {
          res.redirect("/admin/coupon-managment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  postAddCoupon: async (req, res) => {
    try {
      const { name, cashBack, minAmount, expiry, code } = req.body;

      const coupon = new couponModel({
        name,
        cashBack,
        minAmount,
        expiry,
        code,
      });

      coupon.save().then(()=>{
        res.redirect("/admin/coupon-managment");
      })
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  applyCoupon: async (req, res) => {

    try {


        const { coupon: couponCode } = req.body
        console.log(req.body);
        const _id = req.session.user.id

        const user = await userModel.findById({ _id }).lean()


        const address = user.address
        const cart = user.cart

        const cartList = cart.map(item => {
            return item.id
        })

        const product = await productModel.find({ _id: { $in: cartList } }).lean()

        let totalPrice = 0

        product.forEach((item, index) => {
            totalPrice = totalPrice + (item.price * cart[index].quantity)
        })


        const coupon = await couponModel.findOne({ code: couponCode })
        console.log(coupon);
        if (!coupon) {
            return res.render('checkout', { totalPrice, message: 'no coupon available', couponPrice: totalPrice, user, cart, address, product, cashback: 0 })
        }

        if (totalPrice < coupon.minAmount) {
            return res.render('checkout', { totalPrice, message: "Coupon not applicaple (minimum amount must be above" + coupon.minAmount + ")", couponPrice: totalPrice, user, cart, address, product, cashback: 0 })
        }

        if (coupon.expiry < new Date()) {
            return res.render('checkout', { totalPrice, message: "coupon expired", couponPrice: totalPrice, user, cart, address, product, cashback: 0 })

        }

        totalPrice = (totalPrice - coupon.cashBack)



        return res.render('checkout', { totalPrice, message: "coupon applied", user, cart, address, product, couponPrice: totalPrice, cashback: coupon.cashBack, couponcode: coupon.code })


    }

    catch (err) {
        console.log(err)
        res.redirect('/404')

    }
},


}