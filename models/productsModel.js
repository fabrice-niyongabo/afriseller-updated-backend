module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define(
    "products",
    {
      pId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shopId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      priceType: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      singlePrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      onNewArrivals: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      onElectronics: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      onTopRated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      onBeauty: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      onSale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      onBestSelling: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Products;
};
