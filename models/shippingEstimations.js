const { verificationStatusEnum } = require("../helpers");

module.exports = (sequelize, DataTypes) => {
  const ShippingOptions = sequelize.define(
    "shippingOptions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      shopId: {
        type: DataTypes.INTEGER,
      },
      fromCountry: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      toCountry: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return ShippingOptions;
};
