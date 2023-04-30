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
} = require("../helpers");
const db = require("../models");

// models
const Shops = db.shops;
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

const updateDocument = async (req, res) => {
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
        idNumberDocument: req.file.filename,
        verificationStatus: verificationStatusEnum.IN_REVIEW,
      },
      {
        where: {
          supplierId: req.user.supplierId,
        },
      }
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

const updateIdNumber = async (req, res) => {
  try {
    const { idNumber } = req.body;
    if (!idNumber || idNumber.trim().length !== 16) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide a vild ID/Passport Number",
      });
    }
    await Shops.update(
      { idNumber, verificationStatus: "In Review" },
      {
        where: {
          supplierId: req.user.supplierId,
        },
      }
    );

    return res.status(200).json({
      idNumber,
      msg: "Identification number updated successfull.",
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateImage = async (req, res) => {
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
      { where: { supplierId: req.user.supplierId } }
    );
    return res.status(200).json({
      status: "success",
      msg: "Profile Image Updated successfull!",
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
    shopId,
    isActive,
    verificationStatus,
    verificationMessage,
    isDisabled,
    sendNotification,
  } = req.body;
  try {
    const io = req.app.get("socketio");
    if (
      shopId === undefined ||
      isActive === undefined ||
      verificationStatus === undefined ||
      verificationMessage === undefined ||
      isDisabled === undefined ||
      sendNotification === undefined
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }
    const isVerified = verificationStatus === "Verified" ? true : false;
    await Shops.update(
      {
        isActive,
        isVerified,
        verificationStatus,
        verificationMessage,
        isDisabled,
      },
      { where: { shopId } }
    );
    await handleSocketDataUpdate(
      { where: { shopId } },
      Shops,
      io,
      eventNamesEnum.CyizereSupplierEventNames,
      eventNamesEnum.UPDATE_SUPPLIER
    );
    if (sendNotification) {
      await saveNotification(
        supplierId,
        userTypesEnum.AGENT,
        "Cyizere APP Verification",
        verificationMessage,
        io
      );
    }
    return res.status(200).send({ msg: "Supplier Info updated!" });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  register,
  getVerification,
  updateDocument,
  updateIdNumber,
  updateImage,
  adminGetAll,
  udpateShop,
  getAllShops,
};
