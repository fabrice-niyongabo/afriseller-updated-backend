const protectRoutes = (allowedRoles) => {
  return (req, res, next) => {
    if (allowedRoles) {
      if (req.user?.role && allowedRoles.includes(req.user.role)) {
        return next();
      } else if (allowedRoles.includes("riders")) {
        if (req.user?.riderId !== undefined) {
          return next();
        } else {
          return res.status(400).send({
            msg: "You dont have access to this information.",
            error: true,
          });
        }
      } else if (allowedRoles.includes("suppliers")) {
        if (req.user?.supplierId !== undefined) {
          return next();
        } else {
          return res.status(400).send({
            msg: "You dont have access to this information.",
            error: true,
          });
        }
      } else {
        return res.status(400).send({
          msg: "You dont have access to this information.",
          error: true,
        });
      }
    } else {
      return next();
    }
  };
};

module.exports = protectRoutes;
