const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zlcbh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Lamp-Land");
    const productsCollection = database.collection("Products");
    const usersCollection = database.collection("Users");
    const orderCollection = database.collection("Orders");
    const reviewsCollection = database.collection("Reviews");
    // Get multiple Products from the database
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });
    // Add Products  API To the database
    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await productsCollection.insertOne(products);
      res.json(result);
    });
    // DELETE PRODUCT on Products API
    app.delete("/product/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);

      res.json(result);
    });
    // Add Order API To the database
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });
    // GET ALL ORDERS FROM Orders API Database
    app.get("/orders/manageAllOrders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const allOrders = await cursor.toArray();
      res.json(allOrders);
    });

    // UPDATE STATUS From Orders Collection API
    app.put("/status/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: data.isStatus,
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc);
      res.json(result);
    });

    // DELETE ORDER API
    app.delete("/order/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    // ADD REVIEWS TO THE DATABASE
    app.post("/review", async (req, res) => {
      const reviews = req.body;
      console.log("hitting review", reviews);
      const result = await reviewsCollection.insertOne(reviews);
      res.json(result);
    });
    // GET ALL REVIEWS FROM DATABASE
    app.get("/home/review", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.json(reviews);
    });
    // Set An User Admin and Sent to the database
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // Find Admin to show many things
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // Put User login info in database
    app.post("/users", async (req, res) => {
      const user = req.body;
      result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // check user info , if it's found then ignore , if not found then add user info to our database. This works while useing google popup login & emailPass login or register

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const option = { upsert: true };
      const updateDoc = { $set: user };
      result = await usersCollection.updateOne(filter, updateDoc, option);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Lamp Land Server is Running")
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
