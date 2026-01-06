const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const contactRouter = require("./routes/contact");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/contact", contactRouter);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
