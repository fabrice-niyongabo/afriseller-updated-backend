const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const db = require("../models");

// models
const Users = db.users;
// models

const login = async (req, res) => {
  try {
    const { emailOrPhone, password, app } = req.body;

    // Validate user input
    if (!(emailOrPhone && password)) {
      return res
        .status(400)
        .send({ msg: "Please provide your email/phone and password" });
    }
    // Validate if user exist in our database
    const user = await Users.findOne({
      where: {
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          role: user.role,
          phone: user.phone,
          createdAt: user.createdAt,
          names: user.names,
          image: user.image,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn:
            app !== undefined
              ? process.env.TOKEN_EXPIRATION
              : user.role === "admin"
              ? process.env.ADMIN_TOKEN_EXPIRATION
              : process.env.TOKEN_EXPIRATION,
        }
      );
      // user
      return res.status(200).json({
        msg: "Logged in successful",
        userId: user.userId,
        walletAmounts: user.walletAmounts,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        names: user.names,
        image: user.image,
        token,
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
    const { names, email, phone, password, image } = req.body;

    // Validate user input
    if (!(names && email && phone && password)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await Users.create({
      names,
      phone,
      image: image ? image : "",
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        names: user.names,
        image: user.image,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn:
          user.role === "admin"
            ? process.env.ADMIN_TOKEN_EXPIRATION
            : process.env.TOKEN_EXPIRATION,
      }
    );

    // return new user
    return res.status(201).json({
      status: "success",
      msg: "User account created successfull!",
      user: {
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

const googleRegister = async (req, res) => {
  try {
    const { email, id, name, phone } = req.body;

    // Validate user input
    if (!(email && id && name && phone)) {
      return res.status(400).send({
        status: "Error",
        msg: "Unable to sign you up because of some data missing.",
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(id, 10);

    // Create user in our database
    const user = await Users.create({
      names: name,
      phone,
      image: "",
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      googleId: id,
    });

    // Create token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        names: user.names,
        image: user.image,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn:
          user.role === "admin"
            ? process.env.ADMIN_TOKEN_EXPIRATION
            : process.env.TOKEN_EXPIRATION,
      }
    );

    // return new user
    return res.status(201).json({
      status: "success",
      msg: "User account created successfull!",
      user: {
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

const getClientsList = async (req, res) => {
  try {
    const clients = await Users.findAll({
      where: { role: "client" },
      attributes: ["userId", "names", "email", "phone", "image"],
    });
    return res.status(200).json({
      clients,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetAll = async (req, res) => {
  try {
    const clients = await Users.findAll({
      where: { role: "client" },
      order: [["userId", "DESC"]],
    });
    return res.status(200).json({
      clients,
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
    const agent = await Users.findOne({
      where: { userId: req.user.userId },
    });
    if (agent && (await bcrypt.compare(oldPassword, agent.password))) {
      encryptedPassword = await bcrypt.hash(newPassword, 10);
      await Users.update(
        { password: encryptedPassword },
        { where: { userId: req.user.userId } }
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
    const agent = await Users.findOne({
      where: { userId: req.user.userId },
    });
    await Users.update(
      { names, email, phone },
      { where: { userId: req.user.userId } }
    );
    // Create token
    const token = jwt.sign(
      {
        email,
        phone,
        names,
        userId: agent.userId,
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

const updateUserStatus = async (req, res) => {
  const { isActive, userId } = req.body;
  try {
    if (userId === undefined || isActive === undefined) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }
    await Users.update({ isActive }, { where: { userId } });
    return res.status(200).send({ msg: "User Status updated successfully!" });
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
    await Users.update(
      {
        image: req.file.filename,
      },
      { where: { userId: req.user.userId } }
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

const googleLogin = async (req, res) => {
  const { email, googleId } = req.body;
  try {
    if (email === undefined || googleId === undefined) {
      return res.status(400).send({
        status: "Error",
        msg: "Please provide correct information",
      });
    }
    const user = await Users.findOne({
      where: {
        email,
      },
    });
    if (user) {
      // Create token
      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          role: user.role,
          phone: user.phone,
          createdAt: user.createdAt,
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
        userId: user.userId,
        walletAmounts: user.walletAmounts,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        names: user.names,
        image: user.image,
        token,
      });
    } else {
      return res.status(400).send({
        msg: "Invalid Credentials, please sign in with google first so that we can be able authenticate you.",
      });
    }
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  login,
  register,
  getClientsList,
  updateInfo,
  updateImage,
  updatePwd,
  adminGetAll,
  updateUserStatus,
  googleLogin,
  googleRegister,
};
