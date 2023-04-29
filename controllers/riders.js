const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const {
  saveNotification,
  userTypesEnum,
  eventNamesEnum,
  handleSocketDataUpdate,
  saveAdminNotification,
} = require("../helpers");
const db = require("../models");

// models
const Riders = db.riders;
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
    const user = await Riders.findOne({
      where: {
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        {
          riderId: user.riderId,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
          vehicleType: user.vehicleType,
          idNumber: user.idNumber,
          idNumberDocument: user.idNumberDocument,
          names: user.names,
          image: user.image,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: process.env.TOKEN_EXPIRATION,
        }
      );
      // user
      return res.status(200).json({
        msg: "Logged in successful",
        rider: {
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

    const { idNumber, names, email, phone, password, vehicleType, image } =
      req.body;

    // Validate user input
    if (!(names && email && phone && password && idNumber && vehicleType)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await Riders.create({
      names,
      phone,
      password,
      image: image ? image : "",
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      idNumber,
      idNumberDocument: req.file.filename,
      password: encryptedPassword,
      vehicleType,
    });

    // Create token
    const token = jwt.sign(
      {
        riderId: user.riderId,
        email: user.email,
        phone: user.phone,
        vehicleType: user.vehicleType,
        createdAt: user.createdAt,
        idNumber: user.idNumber,
        idNumberDocument: user.idNumberDocument,
        names: user.names,
        image: user.image,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: process.env.TOKEN_EXPIRATION,
      }
    );

    await saveAdminNotification(
      "New Rider Registered!",
      "Rider <b>" +
        user.dataValues.names +
        "</b> is wating for your verification. Please do it ASP"
    );

    // return new user
    return res.status(201).json({
      status: "success",
      msg: "Rider account created successfull!",
      rider: {
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
    const info = await Riders.findOne({
      attributes: [
        "isActive",
        "isVerified",
        "verificationStatus",
        "verificationMessage",
        "isDisabled",
      ],
      where: {
        riderId: req.user.riderId,
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
    await Riders.update(
      {
        idNumberDocument: req.file.filename,
        verificationStatus: "In Review",
      },
      {
        where: {
          riderId: req.user.riderId,
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
    await Riders.update(
      { idNumber, verificationStatus: "In Review" },
      {
        where: {
          riderId: req.user.riderId,
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
    const rider = await Riders.findOne({
      where: { riderId: req.user.riderId },
    });
    if (rider && (await bcrypt.compare(oldPassword, rider.password))) {
      encryptedPassword = await bcrypt.hash(newPassword, 10);
      await Riders.update(
        { password: encryptedPassword },
        { where: { riderId: req.user.riderId } }
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
    const rider = await Riders.findOne({
      where: { riderId: req.user.riderId },
    });
    await Riders.update(
      { names, email, phone },
      { where: { riderId: req.user.riderId } }
    );
    // Create token
    const token = jwt.sign(
      {
        email,
        phone,
        names,
        riderId: rider.riderId,
        createdAt: rider.createdAt,
        idNumber: rider.idNumber,
        idNumberDocument: rider.idNumberDocument,
        image: rider.image,
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
    await Riders.update(
      { isActive: status },
      { where: { riderId: req.user.riderId } }
    );
    return res.status(200).send({ msg: "Rider status updated!", status });
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
    await Riders.update(
      {
        image: req.file.filename,
      },
      { where: { riderId: req.user.riderId } }
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

const adminGetAll = async (req, res) => {
  try {
    const riders = await Riders.findAll({
      order: [["riderId", "DESC"]],
    });
    return res.status(200).json({
      riders,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetSingle = async (req, res) => {
  try {
    const riderId = req.params["id"];
    const rider = await Riders.findOne({
      where: { riderId },
    });
    if (rider) {
      return res.status(200).json({
        rider,
      });
    } else {
      return res.status(400).json({
        msg: "Rider not found",
      });
    }
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const updateRider = async (req, res) => {
  const {
    riderId,
    isActive,
    verificationStatus,
    verificationMessage,
    isDisabled,
    sendNotification,
  } = req.body;
  try {
    const io = req.app.get("socketio");
    if (
      riderId === undefined ||
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
    await Riders.update(
      {
        isActive,
        isVerified,
        verificationStatus,
        verificationMessage,
        isDisabled,
      },
      { where: { riderId } }
    );
    await handleSocketDataUpdate(
      { where: { riderId } },
      Riders,
      io,
      eventNamesEnum.NtumaRiderEventNames,
      eventNamesEnum.UPDATE_RIDER
    );
    if (sendNotification) {
      await saveNotification(
        riderId,
        userTypesEnum.RIDER,
        "Ntuma APP Verification",
        verificationMessage,
        io
      );
    }
    return res.status(200).send({ msg: "Rider Info updated!" });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const updatePosition = async (req, res) => {
  const { lat, long } = req.body;
  const io = req.app.get("socketio");
  try {
    if (!(lat && long)) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }
    await Riders.update(
      { lat, lng: long },
      { where: { riderId: req.user.riderId } }
    );
    handleSocketDataUpdate(
      { where: { riderId: req.user.riderId } },
      Riders,
      io,
      eventNamesEnum.NtumaAdminEventNames,
      eventNamesEnum.UPDATE_RIDER
    );
    return res.status(200).send({ msg: "Information updated successfully!" });
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
  adminGetAll,
  updateRider,
  updatePosition,
  adminGetSingle,
};
