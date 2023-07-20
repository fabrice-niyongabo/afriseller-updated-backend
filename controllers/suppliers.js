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
const Suppliers = db.suppliers;
// models

const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Validate user input
    if (!(emailOrPhone && password)) {
      return res
        .status(400)
        .send({ msg: "Please provide your email/phone and password" });
    }
    // Validate if user exist in our database
    const user = await Suppliers.findOne({
      where: {
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        {
          supplierId: user.supplierId,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
          idNumber: user.idNumber,
          idNumberDocument: user.idNumberDocument,
          names: user.names,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: process.env.TOKEN_EXPIRATION,
        }
      );
      // user
      return res.status(200).json({
        msg: "Logged in successful",
        supplier: {
          ...user.dataValues,
          password: "",
          token,
        },
      });
    } else {
      return res.status(400).send({ msg: "Wrong email/phone or password" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      msg: "Something went wrong while signing into your account. Try again later",
    });
  }
};

const register = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).send({ msg: req.fileValidationError.message });
    }
    if (!req.file) {
      return res
        .status(400)
        .send({ msg: "No file was uploaded, choose ID/Passport document." });
    }

    const {
      idNumber,
      names,
      email,
      phone,
      password,
      shopName,
      shopAddress,
      shopCategoryId,
      open,
      close,
    } = req.body;

    // Validate user input
    if (
      !(
        names &&
        email &&
        phone &&
        password &&
        idNumber &&
        shopName &&
        shopAddress &&
        shopCategoryId &&
        open &&
        close
      )
    ) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await Suppliers.create({
      names,
      phone,
      password,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      idNumber,
      idNumberDocument: req.file.filename,
      password: encryptedPassword,
      shopName,
      shopAddress,
      shopCategoryId,
      open,
      close,
    });

    // Create token
    const token = jwt.sign(
      {
        supplierId: user.supplierId,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        idNumber: user.idNumber,
        idNumberDocument: user.idNumberDocument,
        names: user.names,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: process.env.TOKEN_EXPIRATION,
      }
    );

    await saveAdminNotification(
      "New Supplier Registered!",
      "Supplier <b>" +
        user.dataValues.names +
        "</b> is wating for your verification. Please do it ASP"
    );

    // return new user
    return res.status(201).json({
      status: "success",
      msg: "Supplier account created successfull!",
      supplier: {
        ...user.dataValues,
        password: "",
        token,
      },
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
    const info = await Suppliers.findOne({
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
    await Suppliers.update(
      {
        idNumberDocument: req.file.filename,
        verificationStatus: verificationStatusEnum.UNDER_REVIEW,
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
    await Suppliers.update(
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

const updatePwd = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    if (!(oldPassword && newPassword)) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }
    const supplier = await Suppliers.findOne({
      where: { supplierId: req.user.supplierId },
    });
    if (supplier && (await bcrypt.compare(oldPassword, supplier.password))) {
      encryptedPassword = await bcrypt.hash(newPassword, 10);
      await Suppliers.update(
        { password: encryptedPassword },
        { where: { supplierId: req.user.supplierId } }
      );
      return res.status(200).send({ msg: "Password changed successfull" });
    } else {
      return res.status(400).send({ msg: "Wrong old password" });
    }
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const updateInfo = async (req, res) => {
  const { names, email, phone } = req.body;
  try {
    if (!(names && email && phone)) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }
    const supplier = await Suppliers.findOne({
      where: { supplierId: req.user.supplierId },
    });
    await Suppliers.update(
      { names, email, phone },
      { where: { supplierId: req.user.supplierId } }
    );
    // Create token
    const token = jwt.sign(
      {
        email,
        phone,
        names,
        supplierId: supplier.supplierId,
        createdAt: supplier.createdAt,
        idNumber: supplier.idNumber,
        idNumberDocument: supplier.idNumberDocument,
        image: supplier.image,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: process.env.TOKEN_EXPIRATION,
      }
    );
    return res
      .status(200)
      .send({ msg: "Information updated successfully!", token });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    if (status === undefined) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }
    await Suppliers.update(
      { isActive: status },
      { where: { supplierId: req.user.supplierId } }
    );
    return res.status(200).send({ msg: "Supplier status updated!", status });
  } catch (err) {
    return res.status(400).send({
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
    await Suppliers.update(
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

const getSuppliersList = async (req, res) => {
  try {
    const suppliers = await Suppliers.findAll({
      attributes: ["supplierId", "names", "email", "phone", "image"],
    });
    return res.status(200).json({
      suppliers,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetAll = async (req, res) => {
  try {
    const suppliers = await Suppliers.findAll({
      order: [["supplierId", "DESC"]],
    });
    return res.status(200).json({
      suppliers,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const updateSupplier = async (req, res) => {
  const {
    supplierId,
    isActive,
    verificationStatus,
    verificationMessage,
    isDisabled,
    sendNotification,
  } = req.body;
  try {
    const io = req.app.get("socketio");
    if (
      supplierId === undefined ||
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
    await Suppliers.update(
      {
        isActive,
        isVerified,
        verificationStatus,
        verificationMessage,
        isDisabled,
      },
      { where: { supplierId } }
    );
    await handleSocketDataUpdate(
      { where: { supplierId } },
      Suppliers,
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
  login,
  register,
  getVerification,
  updateDocument,
  updateIdNumber,
  updatePwd,
  updateInfo,
  updateStatus,
  updateImage,
  getSuppliersList,
  adminGetAll,
  updateSupplier,
};
