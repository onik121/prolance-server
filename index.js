require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://reliable-quokka-894072.netlify.app"
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection with Mongoose
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jahid12.81vfswo.mongodb.net/prolance?retryWrites=true&w=majority&appName=jahid12`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.6gwdl3v.mongodb.net/prolance?retryWrites=true&w=majority&appName=AtlasCluster`;
// add by juwel
//  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4ub8q.mongodb.net/jewelranaent?retryWrites=true&w=majority&appName=Cluster0`;


mongoose.connect(uri)
  .then(() => {
    console.log("Successfully connected to MongoDB via Mongoose!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Gig Schema
const gigSchema = new mongoose.Schema({
  gig_title: { type: String, required: true },
  gig_description: { type: String, required: true },
  max_price: { type: Number, required: true },
  min_price: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  gig_image: { type: String, required: true },
  seller_email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  seller_image: { type: String, required: true },
  seller_name: { type: String, required: true },
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});


// Job post  Schema add by juwel
const postJobSchema = new mongoose.Schema({
  job_title: { type: String, required: true },
  job_description: { type: String, required: true },
  max_price: { type: Number, required: true },
  min_price: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  job_image: { type: String, required: true },
  seller_email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  applicationDeadline: { type: Date, default: Date.now },
});

// Models
const Gig = mongoose.model("Gig", gigSchema);
const User = mongoose.model("User", userSchema);
const PostJob = mongoose.model("PostJob", postJobSchema);  // add by juwel 

// Routes
// jwt
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  res.send({ token });
});
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};
// user section
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;

  const query = { email: email };
  try {
    const result = await User.findOne(query);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error finding user" });
  }
});

app.post("/users", async (req, res) => {
  const { name, email, password, photoURL, role } = req.body;
  const query = { email: email };
  const existingUser = await User.findOne(query);
  if (existingUser) {
    return res.send({ message: "User already exists", insertedId: null });
  } else {
    try {
      const user = new User({
        name,
        email,
        password,
        photoURL,
        role,
      });
      const result = await user.save();
      res.send(result);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error creating user" });
    }
  }
});

// Fetch all gigs
app.get('/showgigs', async (req, res) => {
  try {
    const { search,date,delivery,category,sortPrice } = req.query;

   

    // Create filter object for MongoDB query
    let filter = {};

    
    if (search) {


      filter.$or = [
        
        { gig_title: { $regex: search, $options: 'i' } },
        { gig_description: { $regex: search, $options: 'i' } }
      ];


    }
    if(category){
      filter.category=category;
    }
    if (date) {
      filter.created_at = { $gte: new Date(date) };
    }
    if (delivery) {
      // Assuming you have a delivery field in your schema
      filter.delivery_time = { $lte: parseInt(delivery) }; // adjust field name if necessary
    }
    let sort = {};
    if (sortPrice) {
      sort.min_price = sortPrice === "asc" ? 1 : -1;
    }
    // Query MongoDB with filter
    const result = await Gig.find(filter).sort(sort)
    //  console.log(properties);
    res.json(result);
  } catch (error) {
    res.status(500).send('Error fetching properties');
  }
});



// Fetch single gigs
app.get("/showgig/:email", async (req, res) => {
  const email = req.params.email;
  const query = { seller_email: email };
  try {
    const result = await Gig.find(query);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error finding user" });
  }
});

// Create a new gig
app.post("/creategigs",  async (req, res) => {
  try {
    const {
      gig_title,
      gig_description,
      max_price,
      min_price,
      category,
      subcategory,
      gig_image,
      seller_email,
    } = req.body;
    const gig = new Gig({
      gig_title,
      gig_description,
      max_price,
      min_price,
      category,
      subcategory,
      gig_image,
      seller_email,
      seller_image,
      seller_name
    });
    const result = await gig.save();
    res.send(result);
  } catch (error) {
    console.error("Error creating gig:", error);
    res.status(500).send({ message: "Error creating gig" });
  }
});

// delete a gig
app.delete("/gigs/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Gig.findByIdAndDelete(id);
    res.send(result);
  } catch (error) {
    console.error("Error creating gig:", error);
    res.status(500).send({ message: "Error delete gig" });
  }
});



// add by Juwel
app.get("/showAllJob", async (req, res) => {
  try {
    const job = await PostJob.find();
    res.send(job);
  } catch (error) {
    console.error("Error fetching job post data:", error);
    res.status(500).send({ message: "Error fetching job data" });
  }
});

// show job add by juwel
app.get("/showJobUser/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email);
  const query = { seller_email: email };
  console.log(query);
  try {
    const result = await PostJob.find(query);
    res.send(result);
    console.log(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error finding job post" });
  }
});


// Post job add by Juwel


app.post("/jobpost", async (req, res) => {
  try {
    const {
      job_title,
      job_description,
      max_price,
      min_price,
      category,
      subcategory,
      job_image,
      seller_email,
      applicationDeadline,
    } = req.body;
    const post = new PostJob({
      job_title,
      job_description,
      max_price,
      min_price,
      category,
      subcategory,
      job_image,
      seller_email,
      applicationDeadline,
    });
    const result = await post.save();
    res.send(result);
  } catch (error) {
    console.error("Error creating job post:", error);
    res.status(500).send({ message: "Error creating job post" });
  }
});


// GET route for fetching job details by ID [add by juwel]
app.get('/jobDetails/:id', async (req, res) => {
  try {
    // Use Job.findById to retrieve the job document
    const job = await PostJob.findById(req.params.id);
    
    // Check if the job was found
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // If found, send the job document as the response
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// add by juwel
app.delete("/job/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await PostJob.findByIdAndDelete(id);
    res.send(result);
  } catch (error) {
    console.error("Error creating gig:", error);
    res.status(500).send({ message: "Error delete gig" });
  }
});


// Basic health check route
app.get("/", (req, res) => {
  res.send("ProLance is running");
});

// Start the server
app.listen(port, () => {
  console.log(`ProLance is running on port: ${port}`);
});
