require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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

// MongoDB Connection with Mongoose
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.6gwdl3v.mongodb.net/prolance?retryWrites=true&w=majority&appName=AtlasCluster`;

mongoose
  .connect(uri,)
  .then(() => {
    console.log("Successfully connected to MongoDB via Mongoose!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Schema Definitions

// Gig Schema
const gigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  // Reference to the User model
});

// User Schema
const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

// Models
const Gig = mongoose.model("gig", gigSchema);
const User = mongoose.model("users", userSchema);

// Routes
// user section 
app.get("/users", async (req, res) => {
  const users = await User.find()
  res.send(users)
})
app.get("/users/:email",async(req,res)=>{
  const email = req.params.email
  
  const query = {email : email}
  try {
    const result = await User.findOne(query)
    res.send(result)
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error find  user" });
  }
})
app.post("/users", async (req, res) => {
  const { displayName, email, password, photoURL, role } = req.body;
  const query = { email: email };
  const ExistingUser = await User.findOne(query);
  if (ExistingUser) {
    return res.send({ message: "user is already exist", insertedId: null });
  } else {
    try {
      const user = new User({
        displayName,
        email, password, photoURL, role
      })
      const result = await user.save()
      res.send(result)
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error creating user" });
    }
  }
})

// Fetch all gigs
app.get("/showgig", async (req, res) => {
  try {
    const gigs = await Gig.find()
    // console.log(gigs);
    res.send(gigs);
  } catch (error) {
    console.error("Error fetching gigs:", error);
    res.status(500).send({ message: "Error fetching gigs" });
  }
});

// Create a new gig
app.post("/creategigs", async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const gig = new Gig({
      title,
      description,
      price,
      category,

    });
    const result = await gig.save();
    res.send(result);
  } catch (error) {
    console.error("Error creating gig:", error);
    res.status(500).send({ message: "Error creating gig" });
  }
});

// Basic health check route
app.get("/", (req, res) => {
  res.send("ProLance is running ");
});

// Start the server
app.listen(port, () => {
  console.log(`ProLance is running on port: ${port}`);
});
