import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const { Pool } = pg;

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "test",
  user:"lenovo",
  name: "postgres",
  password: "lasha",
});

app.get("/", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM people ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).send("internal server error");
  } finally {
    client.release();
  }
});

app.post("/", async (req, res, next) => {
  const data = req.body;
  const client = await pool.connect();

  try {
    await client.query(
      "insert into people (name, surname, age) values ($1,$2,$3)",
      [data.name, data.surname, data.age]
    );
    res.status(200).send("received post request");
  } catch (error) {
    console.log(error);
    res.status(406).send("not acceptable");
  } finally {
    client.release();
  }
});

app.post("/:id", async (req, res, next) => {
  const data = {
    id: req.params.id,
    name: req.body.name,
    surname: req.body.surname,
    age: req.body.age,
  };
  const client = await pool.connect();
  try {
    client.query(
      "INSERT INTO people (id, name, surname, age) VALUES ($1,$2,$3,$4)",
      [data.id, data.name, data.surname, data.age]
    );
    res.status(200).send("added succesfuli");
  } catch (error) {
    console.log(error);
    res.status(406).send("invalid input");
  } finally {
    client.release();
  }
});

app.put("/:id", async (req, res, next) => {
  const data = {
    id: req.params.id,
    name: req.body.name,
    surname: req.body.surname,
    age: req.body.age,
  };

  const client = await pool.connect();
  try {
    client.query("UPDATE people SET name=$2, surname=$3, age=$4 WHERE id=$1", [
      data.id,
      data.name,
      data.surname,
      data.age,
    ]);
    res.status(200).send("received put request");
  } catch (error) {
    console.log(error);
    res.status(406).send("invalid input");
  } finally {
    client.release();
  }
});

app.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  const client = await pool.connect();
  try {
    client.query("DELETE FROM people WHERE id=$1", [id]);
    res.status(200).send("deleted succesfully");
  } catch (error) {
    console.log(error);
    res.status(409).send("conflict");
  } finally {
    client.release();
  }
});

app.listen(4000, () => {
  console.log("app is listening on port 4000");
});
