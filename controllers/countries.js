const { Op } = require("sequelize");
const db = require("../models");

// models
const Countries = db.countries;
// models

const getAll = async (req, res) => {
  try {
    const countries = await Countries.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    });
    return res.status(200).json({
      countries,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const adminGetAll = async (req, res) => {
  try {
    const countries = await Countries.findAll({});
    return res.status(200).json({
      countries,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

const updateCountry = async (req, res) => {
  try {
    const { name } = req.body;
    // Validate user input
    if (!name) {
      return res.status(400).send({
        status: "Error",
        msg: "Provide correct info",
      });
    }

    const contry = await Countries.findOne({ where: { name } });
    if (contry) {
      const query = { name, isActive: !contry.dataValues.isActive };
      const ctry = await Countries.update(query, { where: { id: contry.id } });
      return res.status(200).json({
        msg: "Country updated successfull",
        country: ctry.dataValues,
      });
    }
    const ctry = await Countries.create({
      name,
    });
    return res.status(200).json({
      msg: "Country updated successfull",
      country: ctry.dataValues,
    });
  } catch (err) {
    res.status(400).send({
      msg: err.message,
    });
  }
};

module.exports = { getAll, updateCountry, adminGetAll };
