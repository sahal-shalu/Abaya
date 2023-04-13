
const orderModel=require('../models/orderModel')
const moment = require("moment");
module.exports={
    getsalesReport: async (req, res) => {
    try {
      let startDate = new Date(new Date().setDate(new Date().getDate() - 8));
      let endDate = new Date();

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate);
        startDate.setHours(0, 0, 0, 0);
      }
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate);
        endDate.setHours(24, 0, 0, 0);
      }
      if (req.query.filter == "thisYear") {
        let currentDate = new Date();
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(new Date().setDate(new Date().getDate() + 1));
        endDate.setHours(0, 0, 0, 0);
      }
      if (req.query.filter == "lastYear") {
        let currentDate = new Date();
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate.getFullYear() - 1, 11, 31);
        endDate.setHours(0, 0, 0, 0);
      }
      if (req.query.filter == "thisMonth") {
        let currentDate = new Date();
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        );
        endDate.setHours(0, 0, 0, 0);
      }
      if (req.query.filter == "lastMonth") {
        let currentDate = new Date();
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate.setHours(0, 0, 0, 0);
      }

      const orders = await orderModel
        .find({ createdAt: { $gt: startDate, $lt: endDate } })
        .sort({ createdAt: -1 })
        .lean();

      let totalOrders = orders.length;
      let totalRevenue = 0;
      let totalPending = 0;
      let totalDelivered = 0;
      let totalCancelled = 0;

      let deliveredOrders = orders.filter((item) => {
        if (item.status == "pending") {
          totalPending++;
        }
        if (item.status == "cancelled") {
          totalCancelled++;
        }

        if (item.status == "delivered") {
          totalRevenue = totalRevenue + item.orderItems.price;
          totalDelivered++;
          return item.paid;
        }
      });

      let filter = req.query.filter ?? "";
      if (!req.query.filter && !req.query.startDate) {
        filter = "lastWeek";
      }
      res.render("salesReport", {
        orders,
        totalDelivered,
        totalOrders,
        totalPending,
        totalRevenue,
        totalCancelled,
        startDate: moment(
          new Date(startDate).setDate(new Date(startDate).getDate() + 1)
        )
          .utc()
          .format("YYYY-MM-DD"),
        endDate: moment(endDate).utc().format("YYYY-MM-DD"),
        filter,
      });
    } catch (err) {
      console.log(err);
    }
  },

}