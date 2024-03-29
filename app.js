import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import pg from "pg";
import "dotenv/config";
const { Pool } = pg;

const app = express();

app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  host: process.env.host,
  port: Number(process.env.port),
  database: process.env.database,
  user: process.env.user,
  password: process.env.password,
});

app.post("/log", async (req, res, next) => {
  const data = req.body;
  const client = await pool.connect();

  const result = await client.query(
    "SELECT name, password FROM users WHERE name=$1 AND password=$2",
    [data.name, data.password]
  );
  console.log(result.rows);
  if (result.rows.length > 0) {
    res.status(200).json({
      name: result.rows[0].name,
      password: result.rows[0].password,
      found: true,
    });
  } else {
    res.status(404).json({
      name: data.name,
      password: data.password,
      found: false,
    });
  }
});

const check = (data) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidCharacters = /[\';"]/;
  if (!data.name || !data.email || !data.password) {
    return { valid: false, message: "Not provided all data" };
  } else if (!emailRegex.test(data.email)) {
    return { valid: false, message: "Not valid Email" };
  } else if (!passwordRegex.test(data.password)) {
    return { valid: false, message: "Incude special characters in password" };
  } else if (
    invalidCharacters.test(data.name) ||
    invalidCharacters.test(data.email) ||
    invalidCharacters.test(data.password)
  ) {
    return { valid: false, message: "sql injection" };
  } else {
    return { valid: true, message: "User added" };
  }
};

app.post("/reg", async (req, res, next) => {
  const data = req.body;
  const client = await pool.connect();
  try {
    const validation = check(data);
    if (validation.valid) {
      const result = await client.query(
        "INSERT INTO users (name, password, email) VALUES ($1,$2,$3)",
        [data.name, data.password, data.email]
      );
      res.status(200).json({
        message: validation.message,
        added: true,
      });
    } else {
      res.status(400).json({
        message: validation.message,
        added: false,
      });
    }
  } catch (error) {
    
    res.status(406).json({message:"user already exists"});
  } finally {
    client.release();
  }
});

app.listen(process.env.hosting, () => {
  console.log(`app is listening port ${process.env.hosting}`);
});
