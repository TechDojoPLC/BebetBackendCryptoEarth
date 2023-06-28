function validateSchema(schema, property = "body", field = "") {
  return (req, res, next) => {
    const validateData = field ? req[property][field] : req[property];

    const { error } = schema.validate(validateData);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");

      res.status(400).json({
        error: message,
      });

      return;
    }
  };
}

module.exports = validateSchema;
