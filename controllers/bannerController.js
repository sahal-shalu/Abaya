const bannerModel=require('../models/bannerModel')
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dtevxccbm",
  api_key: "179654333255418",
  api_secret: "_2AEQkePyB2iFgSu1YsonwJ_kCk",
});

module.exports={
      bannerManagment: async (req, res) => {
        try {
          const banners = await bannerModel.find().lean();
          res.render("bannerManagment", { banners });
        } catch(err) {
          console.log("ful err");
          console.log(err);
        }
      },
      getaddBanner: (req, res) => {
        res.render("addBanner");
      },
      postaddBanner: async (req, res) => {
        try {
          let image = req.files.image[0];
          let imageFile = await cloudinary.uploader.upload(image.path, {
            folder: "Abaya Store",
          });
          let bannerimage = imageFile;
      
          const { name, description } = req.body;
      
          const banner = new bannerModel({
            name,
            description,
            image: bannerimage,
          });
      
          await banner.save();
          res.redirect("/admin/banner-managment");
          console.log("completed");
        } catch (err) {
          console.log(err);
          res.render("addbanner");
        }
      },
     
      unlistBanner: async (req, res) => {
        try {
          const _id = req.params.id;
    
          await bannerModel
            .findByIdAndUpdate(_id, { $set: { status: "unavailable" } })
            .then(() => {
              res.redirect("/admin/banner-managment");
            })
            .catch((err) => {
              console.log(err);
            });
        } catch(err){
          console.log("ful err");
          console.log(err);
        }
      },
      listBanner: async (req, res) => {
        try {
          const _id = req.params.id;
    
          await bannerModel
            .findByIdAndUpdate(_id, { $set: { status: "available" } })
            .then(() => {
              res.redirect("/admin/banner-managment");
            })
            .catch((err) => {
              console.log(err);
            });
        } catch(err) {
          console.log("ful err");
          console.log(err);
        }
      },    
}