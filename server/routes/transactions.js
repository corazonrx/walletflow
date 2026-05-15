const express = require("express");
const db = require("../database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC",
    [req.user.id],
    (error, transactions) => {
      if (error) {
        return res.status(500).json({
          message: "Database error"
        });
      }

      res.json(transactions);
    }
  );
});

router.post("/", authMiddleware, (req, res) => {
  const { type, amount, category, note, date } = req.body;

  if (!type || !amount || !category || !date) {
    return res.status(400).json({
      message: "Type, amount, category, and date are required"
    });
  }

  if (type !== "income" && type !== "expense") {
    return res.status(400).json({
      message: "Type must be income or expense"
    });
  }

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      message: "Amount must be a positive number"
    });
  }

  db.run(
    `
      INSERT INTO transactions (user_id, type, amount, category, note, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [req.user.id, type, numericAmount, category.trim(), note || "", date],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Could not create transaction"
        });
      }

      res.status(201).json({
        message: "Transaction created successfully",
        transaction: {
          id: this.lastID,
          user_id: req.user.id,
          type,
          amount: numericAmount,
          category: category.trim(),
          note: note || "",
          date
        }
      });
    }
  );
});

router.delete("/:id", authMiddleware, (req, res) => {
  const transactionId = req.params.id;

  db.run(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?",
    [transactionId, req.user.id],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Could not delete transaction"
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Transaction not found"
        });
      }

      res.json({
        message: "Transaction deleted successfully"
      });
    }
  );
});

module.exports = router;