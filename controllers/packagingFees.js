const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const PackagingFees = db.packaging_fees;
// models

const getAll = async (req, res) => {
  try {
    let fees = {
      id: 0,
      amount: 100,
      createdAt: "",
      updatedAt: "",
    };
    const allFees = await PackagingFees.findAll({
      order: [["id", "DESC"]],
    });
    if (allFees.length > 0) {
      for (let i = 1; i < allFees.length; i++) {
        await PackagingFees.destroy({
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

const addPackagingFees = async (req, res) => {
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

    const fees = await PackagingFees.create({
      amount,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_PACKAGING_FEES,
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

const updatePackagingFees = async (req, res) => {
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
    const fees = await PackagingFees.update(
      {
        amount,
      },
      { where: { id } }
    );
    await handleSocketDataUpdate(
      { where: { id } },
      PackagingFees,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_PACKAGING_FEES
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
  addPackagingFees,
  updatePackagingFees,
};
