module.exports = (sequelize, DataTypes) => {
  const SupplierPaymentDetails = sequelize.define(
    "supplierPaymentDetails",
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
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      agentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productsList: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      supplierMOMOCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      supplierNames: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },
      payementProof: {
        type: DataTypes.TEXT,
      },
      failureReason: {
        type: DataTypes.TEXT,
      },
    },
    {
      timestamps: true,
    }
  );

  return SupplierPaymentDetails;
};
