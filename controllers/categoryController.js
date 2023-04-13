

const categoryModel=require('../models/categoryModel')

module.exports={
getcategoryManagment:async (req, res) => {
    
    try {
      const categories = await categoryModel.find().lean();
   
      res.render("categoryManagment", { categories });

    } catch (err){
      console.log("ful err");
      console.log(err);
    }
  },
  getaddcategory: (req, res) => {
    res.render("addCategory");
  },
  postAddCategory: async (req, res) => {
    try {
      const category = await categoryModel.findOne({
        category: req.body.category.toLowerCase(),
      });

      if (category) {
        return res.render("addCategory", {
          duplicate: "category already found",
        });
      } else {
        const category = req.body.category;

        const categories = new categoryModel({
          category: category.toLowerCase(),
        });
        categories.save()
          
          res.redirect("/admin/category-managment");
        
      }
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },
  unlistCategory: async (req, res) => {
    try {
      const _id = req.params.id;

      await categoryModel
        .findByIdAndUpdate(_id, { $set: { status: "unavailable" } })
        .then(() => {
          res.redirect("/admin/category-managment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err){
      console.log("ful err");
      console.log(err);
    }
  },
  listCategory: async (req, res) => {
    try {
      const _id = req.params.id;

      await categoryModel
        .findByIdAndUpdate(_id, { $set: { status: "available" } })
        .then(() => {
          res.redirect("/admin/category-managment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  getCategoryEdit : async (req, res) => {
    try {
      const catId = req.params.id;
      const category = await categoryModel.findOne({ _id: catId }).lean();
      if (req.session.admin) {
        res.render("editCategory", { category });
      } else {
        res.redirect('/admin');
      }
    } catch (err) {
      console.error(err);
      res.redirect('/admin/categoryedit');
    }
  },

  postCategoryEdit : async (req, res) => {
    try {
      const { category, _id } = req.body;
      await categoryModel.findByIdAndUpdate(_id, { $set: { category} });
      res.redirect("/admin/category-managment");
    } catch (err) {
      console.error(err);
      res.redirect('/admin/');
    }
  },
}
