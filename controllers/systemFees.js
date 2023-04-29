const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const SystemFees = db.system_fees;
// models

const getAll = async (req, res) => {
  try {
    let fees = {
      id: 0,
      amount: 100,
      createdAt: "",
      updatedAt: "",
    };
    const allFees = await SystemFees.findAll({
      order: [["id", "DESC"]],
    });
    if (allFees.length > 0) {
      for (let i = 1; i < allFees.length; i++) {
        await SystemFees.destroy({
          where: { id: allFees[i].dataValues.id },
          force: true,
        });
      }
      fees = allFees[0].dataValues;
    }
    return res.status(200).json({
      status: "success",
      fees,
    });
  } catch (err) {
    return res.status(400).send({
      msg: err.message,
    });
  }
};

const addSystemFees = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { amount } = req.body;
    // Validate user input
    if (!amount) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const fees = await SystemFees.create({
      amount,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_SYSTEM_FEES,
      data: fees.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "System fees added",
      fees: fees.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateSystemFees = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { amount, id } = req.body;
    // Validate user input
    if (!(amount && id)) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }
    const fees = await SystemFees.update(
      {
        amount,
      },
      { where: { id } }
    );
    await handleSocketDataUpdate(
      { where: { id } },
      SystemFees,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_SYSTEM_FEES
    );
    return res.status(200).json({
      status: "success",
      msg: "System fees updated successfully!",
      fees,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = {
  getAll,
  addSystemFees,
  updateSystemFees,
};
