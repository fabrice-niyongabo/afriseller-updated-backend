module.exports = (sequelize, DataTypes) => {
  const ProductCategories = sequelize.define(
    "product_categories",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      banner: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      icon: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      onCategoriesSection: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      onHeaderSection: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      onHome: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      onHeaderNav: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return ProductCategories;
};
