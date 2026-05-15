const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

const JWT_SECRET = "walletflow_key";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required"
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  db.get(
    "SELECT id FROM users WHERE email = ?",
    [normalizedEmail],
    async (error, existingUser) => {
      if (error) {
        return res.status(500).json({
          message: "Database error"
        });
      }

      if (existingUser) {
        return res.status(409).json({
          message: "Your Email is already registered"
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      db.run(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        [name.trim(), normalizedEmail, passwordHash],
        function (insertError) {
          if (insertError) {
            return res.status(500).json({
              message: "Could not create user"
            });
          }

          const token = jwt.sign(
            {
              id: this.lastID,
              email: normalizedEmail
            },
            JWT_SECRET,
            { expiresIn: "2h" }
          );

          res.status(201).json({
            message: "User created successfully",
            token,
            user: {
              id: this.lastID,
              name: name.trim(),
              email: normalizedEmail
            }
          });
        }
      );
    }
  );
});

module.exports = router;