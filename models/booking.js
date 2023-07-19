const { statusEnum } = require("../helpers");

module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "booking",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shopId: { type: DataTypes.INTEGER, allowNull: false },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      shippingCountry: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      from: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      to: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: statusEnum.PENDING,
      },
    },
    {
      timestamps: true,
    }
  );

  return Booking;
};
