const express=require('express')
const router=express.Router();
const userModel=('../models/userModel.js')
const verifyUser=require('../middlewares/verifyUser')
const controller = require('../controllers/userController');
const productController = require('../controllers/productController');
const checkUser = require('../middlewares/checkUser');
const couponController = require('../controllers/couponController');
const orderController = require('../controllers/orderController');

//login
router.get('/',controller.userHome)
router.get('/login',controller.userLogin)
router.post('/login',controller.postLogin)
router.get('/logout',controller.userLogout)
router.get('/signup',controller.userSignup)
router.post('/signup',controller.postSignup)


//otp
router.get('/otp',controller.getOtp)
router.post('/otp',controller.postOtp)



router.get("/forgot-password", controller.getForgotPassword);
router.get("/forgot-pass-verify", controller.forgotPassotp);
router.post("/forgot-password-email", controller.postForgotPassword);
router.post("/forgot-pass-verify", controller.postforgotPassotp);
router.post("/change-password", controller.changePass);


//contact
router.get('/contact',controller.getContact)

//singleproduct

router.get('/shop', controller.getShop)

//404 error page
router.get('/404',controller.error)

router.use(verifyUser)
router.use(checkUser)

//singleproduct
router.get("/single-product/:id",productController.getsingleProduct);
router.post("/search-product",productController.postSearchProduct);
router.get("/sort-product",productController.getsortProduct);
router.get("/filter-product",productController.getfilterProduct);

//cart
router.get("/product-checkout",productController.getCheckout);
router.post("/checkout", productController.postCheckout);
router.get("/return", productController.getPaymentUrl);
router.get('/cart',controller.getCartPage)
router.get("/addto-cart/:id", controller.addtoCart);
router.get("/remove-cart/:id", controller.removeCart);
router.get("/add-quantity/:id", controller.addQuantity);
router.get('/minus-quantity/:id', controller.minQuantity)
router.post('/check-quantity', controller.checkQuantity)

router.post('/apply-coupon', couponController.applyCoupon)
router.post('/apply-wallet', controller.applyWallet)

//profile
router.get('/profile',controller.getProfilePage)
router.get('/edit-Profile',controller.getEditProfile)
router.post('/edit-Profile',controller.postEditProfile)
router.get('/add-address',controller.getAddAddress)
router.post('/add-address',controller.postAddress)
router.get("/edit-address/:id", controller.getEditAddress);
router.post("/edit-address", controller.postEditAddress);
router.get("/delete-address/:id", controller.deleteAdderess);

//order
router.get("/orders", orderController.getOrders);
router.get("/view-order/:id", orderController.getviewOrder);
router.get("/cancelorder/:id", orderController.cancelOrder);
router.get('/return-order/:id',orderController.returnOrder)

//whishlit
router.get("/whishlist", controller.getWhishlistPage);
router.get("/addto-wishlist/:id", controller.addtowishList);
router.get("/remove-wishlist/:id", controller.removeWishlist);

module.exports=router;