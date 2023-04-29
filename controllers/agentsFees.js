const { Op } = require("sequelize");
const { eventNamesEnum, handleSocketDataUpdate } = require("../helpers");
const db = require("../models");

// models
const AgentsFees = db.agents_fees;
// models

const getAll = async (req, res) => {
  try {
    let fees = {
      id: 0,
      amount: 100,
      createdAt: "",
      updatedAt: "",
    };
    const allFees = await AgentsFees.findAll({
      order: [["id", "DESC"]],
    });
    if (allFees.length > 0) {
      for (let i = 1; i < allFees.length; i++) {
        await AgentsFees.destroy({
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

const addAgentsFees = async (req, res) => {
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

    const fees = await AgentsFees.create({
      amount,
    });
    io.emit(eventNamesEnum.CyizereEventNames, {
      type: eventNamesEnum.ADD_AGENTS_FEES,
      data: fees.dataValues,
    });
    return res.status(201).json({
      status: "success",
      msg: "Agents fees added",
      fees: fees.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateAgentsFees = async (req, res) => {
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
    const fees = await AgentsFees.update(
      {
        amount,
      },
      { where: { id } }
    );
    await handleSocketDataUpdate(
      { where: { id } },
      AgentsFees,
      io,
      eventNamesEnum.CyizereEventNames,
      eventNamesEnum.UPDATE_AGENTS_FEES
    );
    return res.status(200).json({
      status: "success",
      msg: "Agents fees updated successfully!",
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
  addAgentsFees,
  updateAgentsFees,
};
