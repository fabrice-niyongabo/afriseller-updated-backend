const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op, json } = require("sequelize");
const {
  handleSocketDataUpdate,
  eventNamesEnum,
  saveNotification,
  userTypesEnum,
  saveAdminNotification,
  verificationStatusEnum,
  userRolesEnum,
} = require("../helpers");
const db = require("../models");

// models
const Shops = db.shops;
const Users = db.users;
// models

const register = async (req, res) => {
  try {
    const {
      shopName,
      description,
      phone1,
      phone2,
      phone3,
      address,
      open,
      close,
    } = req.body;

    // Validate user input
    if (
      !(
        shopName &&
        description &&
        address &&
        phone1 &&
        open &&
        close &&
        phone2 !== undefined &&
        phone3 !== undefined
      )
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const shop = await Shops.create({
      shopName,
      description,
      phone1,
      phone2,
      phone3,
      address,
      open,
      close,
      userId: req.user.userId,
    });

    //update user details
    await Users.update(
      { role: userRolesEnum.SELLER, shopId: shop.dataValues.shopId },
      { where: { userId: req.user.userId } }
    );

    const user = await Users.findOne({ where: { userId: req.user.userId } });

    // await saveAdminNotification(
    //   "New Supplier Registered!",
    //   "Supplier <b>" +
    //     user.dataValues.names +
    //     "</b> is wating for your verification. Please do it ASP"
    // );

    // return new shop
    return res.status(201).json({
      status: "success",
      msg: "Your shop has been registered!",
      shop,
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      msg: err.message,
    });
  }
};

const getVerification = async (req, res) => {
  try {
    const info = await Shops.findOne({
      attributes: [
        "isActive",
        "isVerified",
        "verificationStatus",
        "verificationMessage",
        "isDisabled",
      ],
      where: {
        supplierId: req.user.supplierId,
      },
    });

    return res.status(200).json({
      info,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateBanner = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).send({ msg: req.fileValidationError.message });
    }
    if (!req.file) {
      return res
        .status(400)
        .send({ msg: "No file was uploaded, choose ID/Passport document." });
    }
    await Shops.update(
      {
        shopBanner: req.file.filename,
      },
      { where: { userId: req.user.userId } }
    );

    return res.status(200).json({
      idNumberDocument: req.file.filename,
      msg: "Identification document updated successfull.",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateShopImage = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send({ msg: req.fileValidationError.message });
  }
  if (!req.file) {
    return res.status(400).send({ msg: "No file was uploaded." });
  }
  try {
    await Shops.update(
      {
        shopImage: req.file.filename,
      },
      { where: { userId: req.user.userId } }
    );
    return res.status(200).json({
      status: "success",
      msg: "Shop Image Updated successfull!",
      image: req.file.filename,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const getAllShops = async (req, res) => {
  try {
    const shops = await Shops.findAll({});
    return res.status(200).json({
      shops,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const getMyShop = async (req, res) => {
  try {
    const shop = await Shops.findOne({ where: { userId: req.user.userId } });
    if (!shop) {
      return res.status(401).json({
        msg: "Unable to find your shop",
      });
    }
    return res.status(200).json({
      shop,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetAll = async (req, res) => {
  try {
    const shops = await Shops.findAll({
      order: [["shopId", "DESC"]],
    });
    return res.status(200).json({
      shops,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const udpateShop = async (req, res) => {
  const {
    shopName,
    description,
    phone1,
    phone2,
    phone3,
    address,
    open,
    close,
    shopId,
  } = req.body;

  try {
    const io = req.app.get("socketio");
    if (
      !(
        shopName &&
        description &&
        address &&
        phone1 &&
        open &&
        close &&
        phone2 !== undefined &&
        phone3 !== undefined &&
        shopId !== undefined
      )
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    await Shops.update(
      {
        shopName,
        description,
        phone1,
        phone2,
        phone3,
        address,
        open,
        close,
        shopId,
      },
      { where: { shopId, userId: req.user.userId } }
    );
    await handleSocketDataUpdate(
      { where: { shopId, userId: req.user.userId } },
      Shops,
      io,
      eventNamesEnum.CyizereSupplierEventNames,
      eventNamesEnum.UPDATE_SUPPLIER
    );
    const shop = await Shops.findOne({
      where: { shopId, userId: req.user.userId },
    });

    if (!shop) {
      return res.status(401).json({
        msg: "Unable to find your shop",
      });
    }

    return res.status(200).send({ msg: "Shop Info updated!", shop });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  register,
  getVerification,
  updateBanner,
  updateShopImage,
  adminGetAll,
  udpateShop,
  getAllShops,
  getMyShop,
};
