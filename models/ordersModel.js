const { statusEnum } = require("../helpers");

module.exports = (sequelize, DataTypes) => {
  const Orders = sequelize.define(
    "orders",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      marketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cartItems: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cartTotalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      systemFees: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      agentFees: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      packagingFees: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      distance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      paymentPhoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deliveryVehicle: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deliveryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deliveryFees: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      deliveryStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: statusEnum.WAITING,
      },
      transactionId: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "-",
      },
      paymentStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      agentId: {
        type: DataTypes.INTEGER,
      },
      acceptedAt: {
        type: DataTypes.DATE,
      },
      sentAt: {
        type: DataTypes.DATE,
      },
      deliveredAt: {
        type: DataTypes.DATE,
      },
      riderId: {
        type: DataTypes.INTEGER,
      },
      confirmationRiderId: {
        type: DataTypes.INTEGER,
      },
      isRiderConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      failureReason: {
        type: DataTypes.TEXT,
      },
      areAllSuppliersPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Orders;
};
