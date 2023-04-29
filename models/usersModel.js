module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "users",
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(15),
        unique: {
          args: true,
          msg: "Phone number already in use!",
        },
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      role: {
        type: DataTypes.TEXT,
        defaultValue: "client",
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      googleId: {
        type: DataTypes.TEXT,
      },
      walletAmounts: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
    }
  );

  return Users;
};
