require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Concept: we connect to the database FIRST, then start listening for
// requests. This avoids a race condition where a request comes in before
// Mongoose is ready.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
