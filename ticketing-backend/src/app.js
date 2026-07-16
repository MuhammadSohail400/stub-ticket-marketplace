const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();



app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Stub API is running",
    timestamp: new Date().toISOString(),
  });
});
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
