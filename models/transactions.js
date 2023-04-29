module.exports = (sequelize, DataTypes) => {
  const Transactions = sequelize.define(
    "transactions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      statusDescription: {
        type: DataTypes.TEXT,
      },
      spTransactionId: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      walletTransactionId: {
        type: DataTypes.TEXT,
      },
      chargedCommission: {
        type: DataTypes.DECIMAL(10, 3),
      },
      currency: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      paidAmount: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      statusCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Transactions;
};
