module.exports = (sequelize, DataTypes) => {
  const RequestedServices = sequelize.define(
    "requested_services_files",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      requestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      addedByuserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fileType: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      file: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return RequestedServices;
};
