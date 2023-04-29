module.exports = (sequelize, DataTypes) => {
  const ProductSubCategories = sequelize.define(
    "product_sub_categories",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return ProductSubCategories;
};
