const routeNotFound = (req, res, next) => {
  return res.status(404).json({ message: "Not Found! Wrong api endpoint" });
};

module.exports = {
  routeNotFound,
};
