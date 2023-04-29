module.exports = (sequelize, DataTypes) => {
  const wallet = sequelize.define(
    "wallet",
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

  return wallet;
};
