const errorMiddleware = (err, req, res, next) => {
  console.error("=================================");
  console.error("❌ API ERROR");
  console.error("Time:", new Date().toISOString());
  console.error("Method:", req.method);
  console.error("URL:", req.originalUrl);
  console.error("Message:", err.message);

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  console.error("=================================");

  let statusCode = err.statusCode || 500;

  let message = err.message || "Internal Server Error";

  // Mongo Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate record found.";
  }

  // Mongo Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // Invalid Mongo ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            name: err.name,
            stack: err.stack
          }
  });
};

export default errorMiddleware;