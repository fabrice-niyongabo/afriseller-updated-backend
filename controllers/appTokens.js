const db = require("../models");

// models
const AppTokens = db.app_tokens;
// models

const getAll = async (req, res) => {
  try {
    const tokens = await AppTokens.findAll({});
    return res.status(200).json({
      status: "success",
      tokens,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const addOrUpdateToken = async (req, res) => {
  console.log({ bod: req.body });
  try {
    const { userId, fbToken, appType } = req.body;
    // Validate user input
    if (userId === undefined || fbToken === undefined) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const oldToken = await AppTokens.findOne({ where: { fbToken, appType } });

    if (oldToken) {
      await AppTokens.update(
        {
          userId,
          fbToken,
          appType,
        },
        { where: { id: oldToken.id } }
      );
    } else {
      await AppTokens.create({
        userId,
        fbToken,
        appType,
      });
    }

    return res.status(200).json({
      status: "success",
      msg: "Token updated successfully!",
    });
  } catch (err) {
    console.log({ err });
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { getAll, addOrUpdateToken };
