const express=require('express')
const userModel=require('../models/userModel')
const router=express.Router();
const adminModel=require('../models/adminModel')
const productModel=require('../models/productModel')
const controller=require('../controllers/adminController')
const productController=require('../controllers/productController')
const categoryController=require('../controllers/categoryController')
const cartController=require('../controllers/cartController')
const couponController=require('../controllers/couponController')
const orderController=require('../controllers/orderController')
const bannerController=require('../controllers/bannerController')
const upload = require("../middlewares/multer");
const verifyAdmin = require('../middlewares/verifyAdmin');
const salesController = require('../controllers/salesController');

//login
router.get('/login',controller.adminLogin)
router.get('/',controller.adminHome)
router.get("/logout", controller.adminLogout);
router.post('/login',controller.postAdminlogin)



//banner

router.get("/banner-managment", bannerController.bannerManagment);
router.get("/add-banner", bannerController.getaddBanner);
router.post("/add-banner",upload.fields([ { name: "image", maxCount: "1" }, ]),bannerController.postaddBanner);
router.post("/unlist-banner/:id", bannerController.unlistBanner);
router.post("/list-banner/:id", bannerController.listBanner);

//user
router.get('/user-managment',controller.getuserManagment)
router.post("/block-user/:id", controller.getuserBlock);
router.post("/unblock-user/:id", controller.getuserUnlock);


//category
router.get('/category-managment',categoryController.getcategoryManagment)
router.get("/add-category", categoryController.getaddcategory); 
router.post("/add-category",categoryController.postAddCategory);
router.post("/unlist-category/:id", categoryController.unlistCategory);
router.post("/list-category/:id", categoryController.listCategory);
router.get('/categoryedit/:id',categoryController.getCategoryEdit);
router.post('/categoryedit',categoryController.postCategoryEdit);



//product
router.post("/list-product/:id", productController.listProduct);
router.post("/unlist-product/:id", productController.unlistProduct);
router.get('/add-product',productController.getaddproduct)
router.get('/productManagment',productController.productManagment)
router.get("/edit-product/:id", productController.getEditProduct);
router.post("/add-product",upload.fields([{ name: "images", maxCount: 3 },{ name: "image", maxCount: "1" },]),productController.postaddProducts);
router.post("/edit-product",upload.fields([{ name: "images", maxCount: 3 },{ name: "image", maxCount: "1" },]),productController.postEditProduct);

 

//order
  router.get("/singleOrder/:id", orderController.getsingleOrder);
  router.get("/orderManagment", orderController.orderManagment);
  router.get("/admin-view-order/:id", orderController.adminOrderView);
  router.get("/cancel-admin-order/:id", orderController.admincancelOrder);
  router.get("/ship-order/:id", orderController.AdminShipOrder);
  router.get("/pending-admin-order/:id", orderController.adminPendingOrder);
  router.get("/deliver-order/:id", orderController.adminDeliveredOrder);
  router.get('/returnProgressing-admin-order/:id',orderController.adminRetrunProgressingOrder)
  router.get('/return-admin-order/:id',orderController.adminReturnOrder)
  router.get("/order-managment", orderController.orderManagment);


  //sales
router.get('/sales-report',salesController.getsalesReport)


//coupon
router.get("/coupon-managment", couponController.couponManagment);
router.get("/addCoupon", couponController.getaddCoupon);
router.post("/addCoupon", couponController.postAddCoupon);
router.post("/unlist-coupon/:id", couponController.unlistCoupon);
router.post("/list-coupon/:id", couponController.listCoupon);


module.exports=router;