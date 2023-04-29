module.exports = (sequelize, DataTypes) => {
  const ridersWallet = sequelize.define(
    "ridersWallet",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      riderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
      },
      transactionType: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "-",
      },
      paymentPhoneNumber: {
        type: DataTypes.STRING(20),
      },
      paymentStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return ridersWallet;
};
