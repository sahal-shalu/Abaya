const productModel = require('../models/productModel')
const categoryModel=require('../models/categoryModel')
const userModel=require('../models/userModel')
const orderModel=require('../models/orderModel')
const axios = require("axios");
const cloudinary = require("cloudinary");
const idcreate = require('../actions/idcreate');
const couponModel = require('../models/couponModel');
cloudinary.config({
  cloud_name: "dtevxccbm",
  api_key: "179654333255418",
  api_secret: "_2AEQkePyB2iFgSu1YsonwJ_kCk",
});

module.exports={
productManagment: async (req, res) => {
    console.log("prd mg");
    try {
      const products = await productModel.find().lean();
      console.log(products);
      res.render("productManagment", { products });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  getaddproduct:async(req,res)=>{
    try {
      const categories = await categoryModel.find().lean();
      console.log(categories);
      res.render("addProduct", { categories });
    } catch (err){
      console.log("ful err");
      console.log(err);
    }
  },
  postaddProducts: async (req, res) => {
    try {
      console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
      console.log(req.body);
      let main_image = req.files.image[0]
      let sub_image = req.files.images;
      let imageFile = await cloudinary.uploader.upload(main_image.path, {
        folder: "Abaya",
      });
      let products = imageFile;

      for (let i in sub_image) {
        let imageFile = await cloudinary.uploader.upload(sub_image[i].path, {
          folder: "Abaya",
        });
        sub_image[i] = imageFile;
      }

      const { name, category, quantity, price, brand, description, mrp } =
        req.body;
        await productModel.create({name,
          category,
          quantity,
          price,
          brand,
          description,
          mrp,
          mainImage:products,
          sideImage:sub_image,}).then((result=>{
           console.log(result);
          }))
          res.redirect('/admin/productManagment')
      
    } catch (err) {
      console.log(err);
      const categories = await categoryModel.find().lean();
      res.render("/admin/addProducts", {
        error: true,
        message: "enter all fieds",
      });
    }
  },
  getEditProduct: async (req, res) => {
    try {
      const _id = req.params.id;
      const product = await productModel.findOne({ _id });

      const categories = await categoryModel.find().lean();
      
      res.render("editProduct", { product, error: false, categories });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  postEditProduct: async (req, res) => {
    try {
      let main_image = req.files?.image?.[0];
      let sub_image = req.files?.images;
  
      let products; // declare variable here
  
      if (req.files?.image) {
        let imageFile = await cloudinary.uploader.upload(main_image.path, {
          folder: "Abaya",
        });
        products = imageFile; // set value of products here
      }
  
      if (req.files?.images) {
        console.log('ennnn')
        for (let i in sub_image) {
          let imageFile = await cloudinary.uploader.upload(sub_image[i].path, {
            folder: "Abaya",
          });
          sub_image[i] = imageFile;
        }
      }
  
      const { name, category, quantity, mrp, brand, price, description, _id } = req.body;
  
      if (req.files.image && req.files.images) {
        console.log("first");
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            name,
            category,
            quantity,
            brand,
            price,
            mrp,
            description,
            mainImage: products, // set mainImage to products here
            sideImage: sub_image,
          },
        });
  
        return res.redirect("/admin/productManagment");
      }
  
      if (!req.files.image && req.files.images) {
        console.log("second");
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            name,
            category,
            quantity,
            brand,
            mrp,
            price,
            description,
            sideImage: sub_image,
          },
        });
  
        return res.redirect("/admin/productManagment");
      }
  
      if (req.files.image && !req.files.images) {
        console.log("third");
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            name,
            category,
            quantity,
            brand,
            mrp,
            price,
            description,
            mainImage: products,
          },
        });
  
        return res.redirect("/admin/productManagment");
      }
  
      if (!req.files.image && !req.files.images) {
        console.log("four");
  
        await productModel.updateOne(
          { _id },
          {
            $set: {
              name,
              category,
              quantity,
              brand,
              mrp,
              price,
              description,
            },
          }
        );
  
        return res.redirect("/admin/productManagment");
      }
  
      return res.redirect("/admin/productManagment");
    } catch (err) {
      console.log("ful err");
      console.log(err);
      const categories = await categoryModel.find().lean();
      res.render("editProduct", {
        error: true,
        message: "Please fill all the fields",
        categories,
        product: req.body,
      });
    }
  },
  listProduct: async (req, res) => {
    console.log("list");
    try {
      const _id = req.params.id;

      await productModel
        .findByIdAndUpdate(_id, { $set: { status: "available" } })
        .then(() => {
          res.redirect("/admin/productManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },
  unlistProduct: async (req, res) => {
    try {
      const _id = req.params.id;

      await productModel
        .findByIdAndUpdate(_id, { $set: { status: "unavailable" } })
        .then(() => {
          res.redirect("/admin/productManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },
  getsortProduct: async (req, res) => {
    try {
      
      let page=req.query.page?? 0

      const categories=await categoryModel.find().lean();
      const productCount=await productModel.find().count()
      const pageCount=Math.ceil(productCount/9)
      const name = req.query.SortBy;

      if (name == "low-high") {
        const products = await productModel.find().sort({ price: 1 }).lean();

        res.render("products", { products ,categories,pageCount,page });
      } else if (name == "high-low") {
        const products = await productModel.find().sort({ price: -1 }).lean();
        res.render("products", { products ,categories,pageCount,page });
      } else {
        const products = await productModel.find().lean();
        res.render("products", {products ,categories,pageCount,page });
      }
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },
  getfilterProduct: async (req, res) => {
    try {


         
      let page=req.query.page?? 0

      const categories=await categoryModel.find().lean();
      const productCount=await productModel.find().count()
      const pageCount=Math.ceil(productCount/9)
      const name = req.query.filterBy;

      const products = await productModel
        .find({ $and: [{ category: name }, { status: "available" }] })
        .lean();
      res.render("products", { products ,categories,pageCount,page});
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },
  postSearchProduct: async (req, res) => {
    try {


       
      let page=req.query.page?? 0

      const categories=await categoryModel.find().lean();
      const productCount=await productModel.find().count()
      const pageCount=Math.ceil(productCount/9)

      const products = await productModel
        .find({
          $and: [
            { status: "available" },
            {
              $or: [
                { name: new RegExp(req.body.name, "i") },
              
              ],
            },
          ],
        })
        .lean();
        console.log(products)
      res.render("products", { products,categories,pageCount,page});
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },
  getCheckout: async (req, res) => {

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
        totalPrice = (totalPrice + (item.price * cart[index].quantity))
    })

    res.render('checkout', { product, totalPrice, address, cart, user })
},
postCheckout: async (req, res) => {


  try {


      const { payment, address: addressId, couponcode, walletUse } = req.body


      
      const _id = req.session.user.id

      const user = await userModel.findById({ _id }).lean()


      const cart = user.cart
      let wallet = user.wallet
      let cartQuantities = {};





      const cartList = cart.map((item) => {
          cartQuantities[item.id] = item.quantity;
          return item.id;
      });



      const { address } = await userModel.findOne({ "address.id": addressId }, { _id: 0, address: { $elemMatch: { id: addressId } } })
      console.log(address)
      const product = await productModel.find({ _id: { $in: cartList } }).lean()


      let totalPrice = 0

      let price = 0


      product.forEach((item, index) => {
          price = price + (item.price * cart[index].quantity)
      })



      const coupon = await couponModel.findOne({ code: couponcode })
      let tempCashback

      if(coupon){
           tempCashback=coupon.cashBack
      }else{
           tempCashback=0
      }

    

  




      req.session.userAddress = {
          id: address[0].id
      }


      if (payment != 'cod') {

          if(walletUse>0){
              price = (price - walletUse) 

              if (price < 0) {
                  
                  price = 0
              }

          }

          if (walletUse) {
              req.session.wallet = {
                  amount: walletUse
              }
          }

          if (couponcode) {
              req.session.coupon = {
                  code: couponcode
              }
          }



          let orderId = "order_" + idcreate();
          const options = {
              method: "POST",
              url: "https://sandbox.cashfree.com/pg/orders",
              headers: {
                  accept: "application/json",
                  "x-api-version": "2022-09-01",
                  "x-client-id": 'TEST353298b8c627b604958e5db2a8892353',
                  "x-client-secret": 'TESTcfee8f9393f0caa7c49d1d9ea13e80ec10db578c',
                  "content-type": "application/json",
              },
              data: {
                  order_id: orderId,
                  order_amount: (price-tempCashback),
                  order_currency: "INR",
                  customer_details: {
                      customer_id: _id,
                      customer_email: user.email,
                      customer_phone: user.mobile.toString(),
                  },
                  
                  order_meta: {
                      // return_url: "http://localhost:3000/return?order_id={order_id}",

                      return_url: "http://localhost:1100/return?order_id={order_id}",
                  },
              },
          };

          await axios
              .request(options)
              .then(function (response) {

                  return res.render("paymenttemp", {
                      orderId,
                      sessionId: response.data.payment_session_id,
                  });
              })
              .catch(function (error) {
                  console.error(error);
              });
      } else {


          let orders = []
          let i = 0
          let cartLength = user.cart.length

          if (walletUse) {
              wallet = wallet - walletUse

              

              price = (price - walletUse )

              

              if (price < 0) {
                  wallet = wallet-price
                  price = 0
              }
              await userModel.updateOne({ _id }, {
                  $set: {
                      wallet: wallet
                  }
              })

          }



          for (let item of product) {

              await productModel.updateOne(
                  { _id: item._id },
                  {
                      $inc: {
                          quantity: -1 * cartQuantities[item._id],
                      },
                  }
              );

              totalPrice = (cart[i].quantity * item.price)

              if (coupon) {
                  totalPrice = totalPrice - (coupon.cashback / cartLength).toFixed(2)
              }

              if (walletUse) {
                  totalPrice = totalPrice - (walletUse / cartLength).toFixed(2)
              }

              totalPrice < 0 ? totalPrice = 0 : totalPrice;

              if (walletUse) {

                  orders.push({
                      address: address[0],
                      orderItems: item,
                      userId: req.session.user.id,
                      quantity: cart[i].quantity,
                      totalPrice : totalPrice,
                      wallet:{applied:true}
                  })


              }else if (coupon) {
                  orders.push({
                      address: address[0],
                      orderItems: item,
                      userId: req.session.user.id,
                      quantity: cart[i].quantity,
                      totalPrice : totalPrice ,
                      coupon: { applied: true, price: coupon.cashback, coupon: coupon }
                  })
              }

              else {
                  orders.push({
                      address: address[0],
                      orderItems: item,
                      userId: req.session.user.id,
                      quantity: cart[i].quantity,
                      totalPrice : totalPrice ,

                  })
              }


              i++;
          }

          const order = await orderModel.create(orders) //work as insert many
          await userModel.findByIdAndUpdate({ _id }, {
              $set: { cart: [] }
          })

          res.render('orderSucsess')
      }

  }

  catch (err) {

      console.log(err)
      res.redirect('/404')

  }



},
getPaymentUrl: async (req, res) => {
  try {
      const order_id = req.query.order_id;
      const options = {
          method: "GET",
          url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
          headers: {
              accept: "application/json",
              "x-api-version": "2022-09-01",
              "x-client-id": 'TEST353298b8c627b604958e5db2a8892353',
              "x-client-secret": 'TESTcfee8f9393f0caa7c49d1d9ea13e80ec10db578c',
              "content-type": "application/json",
          },
      };

      const response = await axios.request(options);


      if (response.data.order_status == "PAID") {


          const _id = req.session.user.id
          const user = await userModel.findOne({ _id }).lean()

          const cart = user.cart
          let wallet = user.wallet
          let cartQuantities = {};



          const cartList = cart.map((item) => {
              cartQuantities[item.id] = item.quantity;
              return item.id;
          });


          const address = req.session.userAddress.id

          console.log('address' + address)

          let newAddress = await userModel.findOne({ _id }, { _id: 0, address: { $elemMatch: { id: address } } })

          console.log('new addres' + newAddress)




          const product = await productModel.find({ _id: { $in: cartList } }).lean()


          let totalPrice = 0

          let price = 0


          product.forEach((item, index) => {
              price = price + (item.price * cart[index].quantity)
          })




          let orders = []
          let i = 0
          let cartLength = user.cart.length


          if (req.session.wallet) {

             

              let walletAmount = req.session.wallet.amount

              

              wallet = wallet - walletAmount

              price = price - walletAmount

              if (price < 0) {
                  wallet = wallet-price
                  price = 0
              }

              

          

              await userModel.updateOne({ _id }, {
                  $set: {
                      wallet: wallet
                  }
              })

          }


          for (let item of product) {

              await productModel.updateOne(
                  { _id: item._id },
                  {
                      $inc: {
                          quantity: -1 * cartQuantities[item._id],
                      },
                  }
              );

              totalPrice = (cart[i].quantity * item.price)

            


              if (req.session.coupon) {

                  console.log('enterrrrr')

                  const couponcode = req.session.coupon.code


                  const coupon = await couponModel.findOne({ code: couponcode })


                  

                  totalPrice = totalPrice - (coupon.cashback / cartLength).toFixed(2)

                  
                  
              }



              if (req.session.wallet) {

                  let walletAmount = req.session.wallet.amount
                  totalPrice = totalPrice - (walletAmount / cartLength).toFixed(2)
                 
              }

              totalPrice < 0 ? totalPrice = 0 : totalPrice;

              

              if(req.session.wallet){

                  orders.push({
                      address:  newAddress.address[0],
                      orderItems: item,
                      userId: req.session.user.id,
                      quantity: cart[i].quantity,
                      paymentType: 'online',
                      paid: true,
                      totalPrice: totalPrice,
                      wallet:{applied:true}
                  })


              }


              else if (req.session.coupon) {

                  const couponcode = req.session.coupon.code


                  const coupon = await couponModel.findOne({ code: couponcode })

                 

                  orders.push({
                      address: newAddress.address[0],
                      orderItems: item,
                      userId: req.session.user.id,
                      quantity: cart[i].quantity,
                      total: totalPrice ,
                      paymentType: 'online',
                      paid: true,
                      coupon: { applied: true, price: coupon.cashback, coupon: coupon }
                  })
                  



              } else {

                  orders.push({
                      address: newAddress.address[0],
                      orderItems: item,
                      userId: req.session.user.id,
                      quantity: cart[i].quantity,
                      totalPrice: totalPrice ,
                      paymentType: 'online',
                      paid: true
                  })
                  

              }

              i++

          }

          const order = await orderModel.create(orders) //work as insert many
          await userModel.findByIdAndUpdate({ _id }, {
              $set: { cart: [] }
          })


          req.session.coupon=null
          req.session.wallet=null
          req.session.address=null

         


          return res.render('orderSucsess')
      } else {
      
          res.send('404')
      }


  } catch (err) {
      console.log(err);
      res.redirect('/404')
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
}