const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op, json } = require("sequelize");
const {
  handleSocketDataUpdate,
  eventNamesEnum,
  saveNotification,
  userTypesEnum,
  saveAdminNotification,
} = require("../helpers");
const db = require("../models");

// models
const Agents = db.agents;
const AgentsMarketSubscriptions = db.agents_market_subscriptions;
const Markets = db.markets;
const Riders = db.riders;
const Orders = db.orders;
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
    const user = await Agents.findOne({
      where: {
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        {
          agentId: user.agentId,
          email: user.email,
          phone: user.phone,
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
      // user
      return res.status(200).json({
        msg: "Logged in successful",
        agent: {
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

    const { idNumber, names, email, phone, password, image } = req.body;

    // Validate user input
    if (!(names && email && phone && password && idNumber)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await Agents.create({
      names,
      phone,
      password,
      image: image ? image : "",
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      idNumber,
      idNumberDocument: req.file.filename,
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      {
        agentId: user.agentId,
        email: user.email,
        phone: user.phone,
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
      "New Agent Registered!",
      "Agent <b>" +
        user.dataValues.names +
        "</b> is wating for your verification. Please do it ASP"
    );

    // return new user
    return res.status(201).json({
      status: "success",
      msg: "Agent account created successfull!",
      agent: {
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
    const info = await Agents.findOne({
      attributes: [
        "isActive",
        "isVerified",
        "verificationStatus",
        "verificationMessage",
        "isDisabled",
      ],
      where: {
        agentId: req.user.agentId,
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
    await Agents.update(
      {
        idNumberDocument: req.file.filename,
        verificationStatus: "In Review",
      },
      {
        where: {
          agentId: req.user.agentId,
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
    await Agents.update(
      { idNumber, verificationStatus: "In Review" },
      {
        where: {
          agentId: req.user.agentId,
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

const subscribeToMarkets = async (req, res) => {
  try {
    const { marketId } = req.body;
    if (!marketId) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }

    const exists = await AgentsMarketSubscriptions.findOne({
      where: { marketId, agentId: req.user.agentId },
    });

    if (exists) {
      return res.status(400).send({
        msg: "Already subscribed to this market.",
      });
    }

    await AgentsMarketSubscriptions.create({
      marketId,
      agentId: req.user.agentId,
    });

    const market = await Markets.findOne({ where: { mId: marketId } });

    return res.status(200).json({
      market,
      msg: `Subscribed to ${market.name} successfull`,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const unSubscribeToMarket = async (req, res) => {
  try {
    const marketId = req.params["id"];
    if (!marketId) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }
    await AgentsMarketSubscriptions.destroy({
      where: { marketId, agentId: req.user.agentId },
      force: true,
    });

    const market = await Markets.findOne({ where: { mId: marketId } });

    return res
      .status(200)
      .json({ market, msg: `UnSubscription request was successfull` });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const getMarketSubscriptions = async (req, res) => {
  try {
    const subscriptions = [];
    const allSubscriptions = await AgentsMarketSubscriptions.findAll({
      where: { agentId: req.user.agentId },
    });
    const markets = await Markets.findAll({});

    for (let i = 0; i < allSubscriptions.length; i++) {
      const market = markets.find(
        (item) =>
          item.dataValues.mId === allSubscriptions[i].dataValues.marketId
      );
      if (market) {
        subscriptions.push({
          ...allSubscriptions[i].dataValues,
          ...market.dataValues,
        });
      }
    }
    return res.status(200).json({
      subscriptions,
    });
  } catch (err) {
    return res.status(400).send({
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
    const agent = await Agents.findOne({
      where: { agentId: req.user.agentId },
    });
    if (agent && (await bcrypt.compare(oldPassword, agent.password))) {
      encryptedPassword = await bcrypt.hash(newPassword, 10);
      await Agents.update(
        { password: encryptedPassword },
        { where: { agentId: req.user.agentId } }
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
    const agent = await Agents.findOne({
      where: { agentId: req.user.agentId },
    });
    await Agents.update(
      { names, email, phone },
      { where: { agentId: req.user.agentId } }
    );
    // Create token
    const token = jwt.sign(
      {
        email,
        phone,
        names,
        agentId: agent.agentId,
        createdAt: agent.createdAt,
        idNumber: agent.idNumber,
        idNumberDocument: agent.idNumberDocument,
        image: agent.image,
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
    await Agents.update(
      { isActive: status },
      { where: { agentId: req.user.agentId } }
    );
    return res.status(200).send({ msg: "Agent status updated!", status });
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
    await Agents.update(
      {
        image: req.file.filename,
      },
      { where: { agentId: req.user.agentId } }
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

const verifyRider = async (req, res) => {
  const { riderId, orderId } = req.body;
  try {
    if (!(riderId && orderId)) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }

    const order = await Orders.findOne({
      where: {
        id: orderId,
        agentId: req.user.agentId,
        riderId: null,
        paymentStatus: "SUCCESS",
      },
    });

    if (!order) {
      return res.status(400).send({
        msg: "Invalid Order. Please try again with correct order.",
      });
    }

    const rider = await Riders.findOne({
      where: {
        riderId,
        isActive: true,
        isVerified: true,
        isDisabled: false,
      },
    });

    if (!rider) {
      return res.status(400).send({
        msg: "Invalid Driver ID. Please check if Driver ID provided is correct or check if the driver is set to be active and not disabled.",
      });
    }

    const deliveryVehicle = JSON.parse(order.dataValues.deliveryVehicle);

    if (rider.dataValues.vehicleType !== deliveryVehicle.vehicleType) {
      return res.status(400).send({
        msg: "The driver you selected does not match the vehicle type of the order that you are processing.",
      });
    }

    return res.status(200).send({
      msg: "Do you want to send this order to Driver " + rider.names + "?",
      rider,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const getAgentsList = async (req, res) => {
  try {
    const agents = await Agents.findAll({
      attributes: ["agentId", "names", "email", "phone", "image"],
    });
    return res.status(200).json({
      agents,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetAll = async (req, res) => {
  try {
    const agents = await Agents.findAll({
      order: [["agentId", "DESC"]],
    });
    return res.status(200).json({
      agents,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const updateAgent = async (req, res) => {
  const {
    agentId,
    isActive,
    verificationStatus,
    verificationMessage,
    isDisabled,
    sendNotification,
  } = req.body;
  try {
    const io = req.app.get("socketio");
    if (
      agentId === undefined ||
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
    await Agents.update(
      {
        isActive,
        isVerified,
        verificationStatus,
        verificationMessage,
        isDisabled,
      },
      { where: { agentId } }
    );
    await handleSocketDataUpdate(
      { where: { agentId } },
      Agents,
      io,
      eventNamesEnum.NtumaAgentEventNames,
      eventNamesEnum.UPDATE_AGENT
    );
    if (sendNotification) {
      await saveNotification(
        agentId,
        userTypesEnum.AGENT,
        "Ntuma APP Verification",
        verificationMessage,
        io
      );
    }
    return res.status(200).send({ msg: "Agent Info updated!" });
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
  subscribeToMarkets,
  unSubscribeToMarket,
  getMarketSubscriptions,
  updatePwd,
  updateInfo,
  updateStatus,
  updateImage,
  verifyRider,
  getAgentsList,
  adminGetAll,
  updateAgent,
};
