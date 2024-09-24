require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

// app.use(express.urlencoded({ extended: true }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4ub8q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const gigCollection = client.db("prolance").collection("gigs");
    const usersCollection = client.db("prolance").collection("users");

// data import from the users collection for showing gig UI
    app.get("/showgig", async (req, res) => {
      const cursor = gigCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/creategigs", async (req, res) => {
      const user = req.body;
      console.log("new GIG", user);
      const result = await gigCollection.insertOne(user);
      res.send(result);
    });

  

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
// run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ProLance is running");
});

app.listen(port, () => {
  console.log(`ProLance is running on port: ${port}`);
});
