const express = require("express");
const path = require("path");
require("./database");

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "WalletFlow backend is running okk"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
