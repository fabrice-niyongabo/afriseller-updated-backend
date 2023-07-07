const db = require("../models");

// models
const Shops = db.shops;
const ShippingEstimations = db.shipping_estimations;
// models

const getSingle = async (req, res) => {
  try {
    const { supplierId } = req.params["id"];
    if (!supplierId) {
      return res.status(400).json({
        msg: "Prease provide correct info",
      });
    }

    const estimations = ShippingEstimations.findAll({ supplierId });
    return res.status(200).json({
      estimations,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminAll = async (req, res) => {
  try {
    const estimations = ShippingEstimations.findAll({});
    return res.status(200).json({
      estimations,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const addEstimation = async (req, res) => {
  try {
    const { fromCountry, toCountry, amount, currency } = req.body;

    // Validate user input
    if (!(fromCountry && toCountry && amount && currency)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //validate product
    const shop = await Shops.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!shop) {
      return res.status(401).send({
        status: "Error",
        msg: "Could not find your shop details",
      });
    }

    const oldEstimation = await ShippingEstimations.findOne({
      where: {
        userId: req.user.userId,
        toCountry,
      },
    });
    if (oldEstimation) {
      return res.status(400).send({
        success: false,
        msg: "Estimation already exists for " + toCountry,
      });
    }

    const estimation = await ShippingEstimations.create({
      userId: shop.dataValues.userId,
      shopId: shop.dataValues.shopId,
      fromCountry,
      toCountry,
      amount,
      currency,
    });
    return res.status(201).json({
      status: "success",
      msg: "Estimation added successfull!",
      estimation: estimation.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateEstimation = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { id, toCountry, amount, currency, shopId } = req.body;
    // Validate user input
    if (!(id && toCountry && amount && currency && shopId)) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct info",
      });
    }

    await ShippingEstimations.update(
      {
        toCountry,
        currency,
        amount,
      },
      { where: { id, shopId, userId: req.user.userId } }
    );

    return res.status(200).json({
      status: "success",
      msg: "Estimation updated successfull!",
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const deleteEstimation = async (req, res) => {
  try {
    const id = req.params["id"];
    // Validate user input
    if (!id) {
      res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const estimation = await ShippingEstimations.destroy({
      where: { id, userId: req.user.userId },
      force: true,
    });
    return res.status(200).json({
      status: "success",
      msg: "Estimation deleted successfull!",
      estimation,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  adminAll,
  addEstimation,
  updateEstimation,
  deleteEstimation,
  getSingle,
};
