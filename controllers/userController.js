const express=require('express')
const router=express.Router();
const userModel=require('../models/userModel')
const categoryModel=require('../models/categoryModel')
const orderModel=require('../models/orderModel')
const productModel=require('../models/productModel')
const bannerModel=require('../models/bannerModel')
const couponModel=require('../models/couponModel')
const sendOtp=require('../actions/otp');
const idcreate = require("../actions/idcreate");
const { log } = require('console');    
const { checkout } = require('../routers/userRouter');

module.exports = {
 userHome :async(req,res)=>{

  const banner=await bannerModel.find({ status:"available" }).lean();
    if(req.session.user){
     
        res.render('userHome',{userName: req.session.user.name,banner})
    }else{
 
        res.render('userHome',{userName:'login',banner})
    }  
    },
    getHomePage: async (req, res) => {
      try {
        if (req.session.user) {
          const banner = await bannerModel.find({ status: "available" }).lean();
  
          res.render("home", { banner });
        } else {
          res.redirect("/login");
        }
      } catch (err) {
        res.render("404");
        console.log(err);
      }
    },
    userLogin:(req,res)=>{
      if (req.session.user) {
        res.redirect('/')
    } else {
        res.render('userLogin')
    }
    },
    userSignup:(req,res)=>{
        res.render('userSignup')
    },
    postSignup: async (req, res) => {
        try {
          const { name,email,password,mobile} =req.body
          const user = await userModel.findOne({ email: req.body.email });
    
          if (user) {
            return res.render("userSignup", { duplicate: "User already found" });
          }
    
          if (
            req.body.name == "" ||
            req.body.email == "" ||
            req.body.password == "" ||
            req.body.mobile == ""
          ) {
            const fieldRequired = " Please enter all fields ";
            res.render("userSignup", { fieldRequired });
          } else {
            if (req.body.password != req.body.cpassword) {
              res.render("userSignup", { passworder: "passwords are not same" });
            } else {
              randomOtp = Math.floor(Math.random() * 10000);
              req.session.otp = randomOtp;
                console.log(randomOtp)
              sendOtp(req.body.email, randomOtp)
                .then(() => {
                  return res.render("otp", { user: req.body });
                })
                .catch((err) => {
                  return res.render("userSignup", {
                    error: true,
                    message: "email sent failed",
                  });
                });
            }
          }
        } catch (err) {
          res.render('404')
          console.log(err);
        }
      },
      getOtp:(req,res)=>{
        res.render('otp')
      },
      postOtp: (req, res) => {
        const { name, email, password, mobile } = req.body;
        
        if (req.body.otp == req.session.otp) {
          const user = new userModel({ name, email, mobile, password });
          
          user.save()
              req.session.user = {
                name,
                id: user._id,
              };
    
              res.redirect("/");
            
          
        } else {
          res.render("otp", {
            error: true,
            otpmessage: "Invalid OTP",
            ...req.body,
          });
        }
      },
      postLogin: async (req, res) => {
        try {
          
          const { email, password } = req.body;
    
          let user = await userModel.findOne({ email });
    
          if (user) {
            if (user.status == "block") {
              res.render("userLogin", { ban: "Your account is banned" });
            } else {
              if (email == user.email && password == user.password) {
                req.session.user = {
                  name: user.name,
                  id: user._id,
                };
                res.redirect("/");
              } else {
                console.log("password err")
                res.render("userLogin", { err:"Incorrect password" });
              }
            }
          } else {
            console.log(" no user")
            res.render("userLogin", { error: true });
          }
        } catch (err) {
          res.render('404')
          console.log(err);
        }
      },
      userLogout:(req,res)=>{
           req.session.user=null
           res.redirect('/login')
      },
      getShop:async(req,res)=>{
       try{
        
         let page=req.query.page?? 0

        const categories=await categoryModel.find().lean();
        const productCount=await productModel.find().count()
        const pageCount=Math.ceil(productCount/9)
        const products=await productModel.find().sort({products:1}).skip(page*9).limit(9).lean();
        
        res.render('products',{products,categories,pageCount,page})
       }catch(err){
        res.render('404')
        console.log(err)
       }
      },
      getCartPage: async (req, res) => {

        const _id = req.session.user.id

        const { cart } = await userModel.findOne({ _id }, { cart: 1 })

        console.log(cart)

        const cartList = cart.map(item => {
            return item.id
        })
        console.log(cartList)
        // console.log(cart)

        const product = await productModel.find({ _id: { $in: cartList } }).lean()//$in for each elememnt in cart becaus eit has al ot ids //cart il product inte id ind . product modelil ella productsindum id indavum.aah randu id check cheythal equal aaya product kittum 

    

        let totalPrice = 0;

        product.forEach((item, index) => {
            totalPrice = totalPrice + (item.price * cart[index].quantity);
        })

        let totalMrp = 0

        product.forEach((item, index) => {
            totalMrp = totalMrp + (item.mrp * cart[index].quantity)
        })

        res.render('cart', { product, totalPrice, cart, totalMrp })

    },  
      addtoCart: async (req, res) => {
        try {
          const id = req.session.user.id;
          const productId = req.params.id;

          await userModel.updateOne(
            { _id:id },

            { $addToSet: { cart: { id: productId, quantity: 1 } } }
          );
    
          res.redirect("/cart");
        } catch (err) {
          res.render('404')
          console.log(err);
        }
      },
      removeCart: async (req, res) => {
        try {
          const _id = req.session.user.id;
          const productId = req.params.id;
    
          await userModel.updateOne(
            { _id },
            {
              $pull: {
                cart: { id: productId },
              },
            }
          );
          res.redirect("/cart");
        } catch (err) {
          res.render('404')
          console.log(err);
        }
      },
      checkQuantity: async (req, res) => {


        let address = req.user.address;
        const cart = req?.user?.cart ?? [];

        console.log(cart)

        let cartQuantities = {};
        const cartList = cart.map((item) => {
            cartQuantities[item.id] = item.quantity;
            return item.id;
        });
        let totalPrice = 0;
        let products = await productModel
            .find({ _id: { $in: cartList } })
            .lean();
        let quantityError = false;
        let outOfQuantity = [];
        for (let item of products) {
            totalPrice = totalPrice + item.price * cartQuantities[item._id];
            if (item.quantity < cartQuantities[item._id]) {
                quantityError = true;
                outOfQuantity.push({ id: item._id, balanceQuantity: item.quantity });
            } else {
            }
        }
        req.session.tempOrder = {
            totalPrice,
        };
        if (quantityError) {
            return res.json({ error: true, outOfQuantity });
        }
        return res.json({ error: false });


    },
    addQuantity: async (req, res) => {

      // const product=await productModel.findById({_id:req.params.id}).lean()


      // const quantity=product.quantity





      const user = await userModel.updateOne({ _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } }, {

          $inc: {
              "cart.$.quantity": 1
          }

      })

      res.json({ user })

  },
  minQuantity: async (req, res) => {
    let { cart } = await userModel.findOne(
        { "cart.id": req.params.id },
        { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
    );
    console.log(req.params.id);
    if (cart[0].quantity <= 1) {
        let user = await userModel.updateOne(
            { _id: req.session.user.id },
            {
                $pull: {
                    cart: { id: req.params.id },
                },
            }
        );

        return res.json({ user: { acknowledged: false } });
    }
    let user = await userModel.updateOne(
        { _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } },
        {
            $inc: {
                "cart.$.quantity": -1,
            },
        }
    );
    return res.json({ user });

},
      getForgotPassword: (req, res) => {
        res.render("forgotPassword");
      },
      postForgotPassword: async (req, res) => {
        try {
          const { email } = req.body;
    
          const user = await userModel.findOne({ email });
    
          if (user) {
            let otp = Math.floor(1000 + Math.random() * 9000);
            await sendOtp(req.body.email, otp);
            req.session.temp = {
              email,
              otp,
            
            };
    console.log(otp)
            return res.redirect("/forgot-pass-verify");
          } else {
            return res.render("forgotPassword", { duplicate: "User not found" });
          }
        } catch (err) {
          res.render("404");
          console.log(err);
        }
      },    
      postforgotPassotp: async (req, res) => {
        try {
          const { otp } = req.body;
          if (req.session.temp.otp == otp) {
          
            return res.render("changePassword");
          } else {
            return res.render("forgotpassword", {
              otpmessage: "please enter a valid otp",
            });
          }
        } catch (err) {
         
          console.log(err);
          res.render("404");
        }
      },
      forgotPassotp: (req, res) => {
        res.render("forgotPassOtp", { email: req.session.temp.email });
      },
      changePass: async (req, res) => {
        try {
          const { newpass, cpass } = req.body;
    
          if (newpass == cpass) {
            await userModel.findOneAndUpdate(
              { email: req.session.temp.email },
              {
                $set: {
                  password: newpass,
                },
              }
            );
    
            return res.redirect("/login");
          }
    
          return res.render("changePassword", { message: "password not match" });
        } catch (err) {
          res.render("404");
          console.log(err);
        }
      },
      getContact:(req,res)=>{
        res.render('contact')
      },
  getCheckout:async(req,res)=>{
    if(req.session.user){
      res.render('checkout')
    }else{
      res.redirect('login')
    }
  },
  getsingleProduct: async (req, res) => {
    try {
      const id = req.session.user.id;
      const user = await userModel.findById({ _id: id }).lean();
      const _id = req.params.id;
      const product = await productModel.findById(_id).lean();
      

      if (user.wishlist.includes(_id)) {
        return res.render("single-product", { product, wish: true });
      } else {
        return res.render("single-product", { product, wish: false });
      }
    } catch (err) {
      res.render('404')
      console.log(err);
    }
  },
  getProfilePage: async (req, res) => {
    try {
      const id = req.session.user.id;
      const user = await userModel.findById({ _id: id }).lean();
      res.render("userProfile", { user });
    } catch (error) {
       res.render('404')
      console.log(error);
    }
  },
  getEditProfile: async (req, res) => {
    try {
      const id = req.session.user.id;
      const user = await userModel.findById({ _id: id }).lean();
      res.render("editProfile", { user });
    } catch (error) {
      res.render('404')
      console.log(error);
    }
  },
  postEditProfile: async (req, res) => {
    const { name, mobile, _id } = req.body;

    try {
      await userModel.findByIdAndUpdate(_id, { $set: { name, mobile } });
      res.redirect("/profile");
    } catch (error) {
      res.render('404')
      console.log(error);
    }
  },
  getAddAddress: (req, res) => {
    res.render("addAddress");
  },
  postAddress: async (req, res) => {
    try {
      const _id = req.session.user.id;
      

      await userModel.updateOne(
        { _id },
        {
          $addToSet: {
            address: {
              ...req.body,
            id: idcreate(),
            },
          },
        }
      );
      res.redirect("/profile");
    } catch (error) {
      res.render('404')
      console.log(error);
    }
  },
  getEditAddress: async (req, res) => {
    const id = req.params.id;

    try {
      let { address } = await userModel.findOne(
        { "address.id": id },
        { _id: 0, address: { $elemMatch: { id } } }
      );
      res.render("editAddress", { address: address[0] });
    } catch (error) {
      res.render('404')
      console.log(error);
    }
  },
  postEditAddress: async (req, res) => {
    try {
      await userModel.updateOne(
        {
          _id: req.session.user.id,
          address: { $elemMatch: { id: req.body.id } },
        },
        {
          $set: {
            "address.$": req.body,
          },
        }
      );
      res.redirect("/profile");
    } catch (error) {
      res.render('404')
      console.log(error);
    }
  },
  deleteAdderess: async (req, res) => {
    const _id = req.session.user.id;
    const id = req.params.id;

    try {
      await userModel.updateOne(
        { _id, address: { $elemMatch: { id } } },
        {
          $pull: {
            address: { id },
          },
        }
      );
      res.redirect("back");
    } catch (error) {
    res.render('404')
      console.log(error);
    }
  },
  getWhishlistPage: async (req, res) => {
    try {
      const _id = req.session.user.id;

      const user = await userModel.findById({ _id }).lean();

      const wishlist = user.wishlist;

      const product = await productModel
        .find({ _id: { $in: wishlist } })
        .lean(); //$in for each elememnt in cart becaus eit has al ot ids //cart il product inte id ind . product modelil ella productsindum id indavum.aah randu id check cheythal equal aaya product kittum

      let empty;
      wishlist.length == 0 ? (empty = true) : (empty = false);
      res.render("wishlist", { product, empty });
    } catch (err) {
    res.render('404')
      console.log(err);
    }
  },
  addtowishList: async (req, res) => {
    try {
      const _id = req.session.user.id;

      const proId = req.params.id;
      await userModel.updateOne(
        { _id },
        {
          $addToSet: {
            wishlist: proId,
          },
        }
      );
      res.redirect("back");
    } catch (err) {
     res.render('404')
      console.log(err);
    }
  },
  removeWishlist: async (req, res) => {
    try {
      const _id = req.session.user.id;
      const id = req.params.id;

      await userModel.updateOne(
        { _id },
        {
          $pull: {
            wishlist: id,
          },
        }
      );

      res.redirect("back");
    } catch (err) {
      res.render('404')
      console.log(err);
    }
  },
  error:(req,res)=>{
    res.render('404')
  },
  applyWallet: async (req, res) => {


    try {

        const _id = req.session.user.id

        const { amount } = req.body

        console.log('amount = ' + amount)

        const user = await userModel.findById({ _id }).lean()

        let wallet = user.wallet - amount





        const address = user.address
        const cart = user.cart

        const cartList = cart.map(item => {
            return item.id
        })

        const product = await productModel.find({ _id: { $in: cartList } }).lean()

        let totalPrice = 0

        product.forEach((item, index) => {
            totalPrice = (totalPrice + (item.price * cart[index].quantity))
        })

        totalPrice = (totalPrice - amount) 



        if (totalPrice < 0) {
            wallet = wallet - totalPrice
            totalPrice = 0
        }

     

        res.render('checkout', { wallet, product, totalPrice, user, address, cart, amount })



    }
    catch (err) {
        console.log(err)
        res.redirect('/404')
    }


},
}