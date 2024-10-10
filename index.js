require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb"); // juwel
//const http = require("http"); // juwel
//const socketIo = require("socket.io"); // juwel
//const { Server } = require('socket.io'); // add by juwel
//const server = http.createServer(app); // add by juw
//const io = new Server(server, { cors: { origin: '*' } }); // add by juwel
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
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jahid12.81vfswo.mongodb.net/prolance?retryWrites=true&w=majority&appName=jahid12`;
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.6gwdl3v.mongodb.net/prolance?retryWrites=true&w=majority&appName=AtlasCluster`;
// add by juwel
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4ub8q.mongodb.net/jewelranaent?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(uri)
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

// Define the schema for the bit data
const bitSchema = new mongoose.Schema({
  bit_title: { type: String, required: true },
  bit_description: { type: String, required: true },
  bit_price: { type: Number, required: true },
  job_image: { type: String, required: false }, //  job image is not always required
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  created_at: { type: Date, default: Date.now }, // Default to the current date/time
  applicationDeadline: { type: Date, required: true },
  seller_email: { type: String, required: true },
  seller_image: { type: String, required: false }, // Optional, can have a default if needed
  seller_name: { type: String, required: true },
  status: { type: String, default: "pending" },
  BitId: { type: String, required: true },
  Buyer_email: { type: String, required: true },
});

// review rating schema add by juwel
// const RatingSchema = new mongoose.Schema({
//   freelancerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "Freelancer",
//   },
//   clientId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "Client",
//   },
//   rating: { type: Number, required: true, min: 1, max: 5 },
//   review: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });
// Real time project tracking  add by juwel
// const ProjectSchema = new mongoose.Schema(
//   {
//     title: String,
//     description: String,
//     status: {
//       type: String,
//       enum: ["pending", "in-progress", "completed"],
//       default: "pending",
//     },
//     milestones: [
//       {
//         title: String,
//         description: String,
//         dueDate: Date,
//         completed: {
//           type: Boolean,
//           default: false,
//         },
//       },
//     ],
//     freelancer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     deadline: Date,
//     files: [String], // File URLs or paths
//   },
//   { timestamps: true }
// );

// review and rating schema add by juwel
const ratingSchema = new mongoose.Schema({
  freelancerId: { type: String, required: false },
  
  clientId: { type: String, required: false },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Define Project Schema
// const projectSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   status: String,
//   deadline: Date,
//   milestones: [
//     {
//       title: String,
//       dueDate: Date,
//       completed: Boolean,
//     },
//   ],
// });

// Models
const Gig = mongoose.model("Gig", gigSchema);
const User = mongoose.model("User", userSchema);
const PostJob = mongoose.model("PostJob", postJobSchema); // add by juwel
const Bit = mongoose.model("Bit", bitSchema); // add  by juwel
const Rating = mongoose.model("Rating", ratingSchema); // add by juwel
// const Project = mongoose.model('Project', projectSchema); add by juwel  Project Model

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

app.get("/showgig", async (req, res) => {
  try {
    const gigs = await Gig.find();
    res.send(gigs);
  } catch (error) {
    console.error("Error fetching gigs:", error);
    res.status(500).send({ message: "Error fetching gigs" });
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
app.post("/creategigs", async (req, res) => {
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
      seller_name,
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
  // console.log(email);
  const query = { seller_email: email };
  // console.log(query);
  try {
    const result = await PostJob.find(query);
    res.send(result);
    // console.log(result);
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
app.get("/jobDetails/:id", async (req, res) => {
  try {
    // Use Job.findById to retrieve the job document
    const job = await PostJob.findById(req.params.id);

    // Check if the job was found
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // If found, send the job document as the response
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// add by juwel
app.delete("/job/:id", async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  try {
    const result = await PostJob.findByIdAndDelete(id);
    res.send(result);
  } catch (error) {
    console.error("Error creating gig:", error);
    res.status(500).send({ message: "Error delete gig" });
  }
});

// Route to create a new bit (POST /bits) add by juwel
app.post("/bits", async (req, res) => {
  const {
    BitId,
    bit_title,
    bit_description,
    bit_price,
    bit_image,
    category,
    subcategory,
    applicationDeadline,
    seller_email,
    seller_image,
    seller_name,
    Buyer_email,
  } = req.body;
  // console.log(req.body);
  try {
    // Create a new bit document
    const newBit = new Bit({
      BitId,
      bit_title,
      bit_description,
      bit_price: parseInt(bit_price),
      bit_image,
      category,
      subcategory,
      created_at: new Date(),
      applicationDeadline: new Date(applicationDeadline),
      seller_email,
      seller_image,
      seller_name,
      Buyer_email,
      status: "pending",
    });

    // Save the bit to the database
    const savedBit = await newBit.save();

    // Send the saved bit as the response
    res.status(201).json(savedBit);
  } catch (error) {
    console.error("Error creating bit:", error);
    res.status(500).json({ error: "Failed to create bit" });
  }
});

// GET: Fetch all bits (GET /bits)
app.get("/bits", async (req, res) => {
  try {
    const bits = await Bit.find({});
    res.status(200).json(bits);
  } catch (error) {
    console.error("Error fetching bits:", error);
    res.status(500).json({ error: "Failed to fetch bits" });
  }
});

// Fetch  bits by seller's email (GET /bits/:email)
app.get("/showBitUser/email/:email", async (req, res) => {
  const sellerEmail = req.params.email;

  try {
    // Find a bit by seller's email
    const bit = await Bit.find({ seller_email: sellerEmail });

    // Check if the bit exists
    if (!bit) {
      return res.status(404).json({ error: "Bit not found" });
    }

    // Send the found bit as a JSON response
    res.status(200).json(bit);
  } catch (error) {
    console.error("Error fetching bit:", error);
    res.status(500).json({ error: "Failed to fetch bit" });
  }
});
// Fetch  bits by buyer's email (GET /bits/:email)
app.get("/showBitBuyer/email/:email", async (req, res) => {
  const buyerEmail = req.params.email;

  try {
    // Find a bit by seller's email
    const bit = await Bit.find({
      Buyer_email: buyerEmail,
    });

    // Check if the bit exists
    if (!bit) {
      return res.status(404).json({ error: "Bit not found" });
    }

    // Send the found bit as a JSON response
    res.status(200).json(bit);
  } catch (error) {
    console.error("Error fetching bit:", error);
    res.status(500).json({ error: "Failed to fetch bit" });
  }
});

// Route to approve a bit (PATCH /bitUpdate/:id) add juwel
// app.patch("/bitUpdate/:id", async (req, res) => {
//   const { id } = req.params;
//   const { action } = req.body;

//   // Log the BitId and action to check values
//   console.log("BitId:", id);
//   console.log("Action:", action);

//   // Validate the action
//   if (!action || (action !== "approve" && action !== "reject")) {
//     return res
//       .status(400)
//       .json({ error: 'Invalid action. Use "approve" or "reject".' });
//   }

//   try {
//     const status = action === "approve" ? "Approved" : "Rejected";

//     const updatedBit = await Bit.findByIdAndUpdate(
//       // {BitId:new ObjectId(BitId)},
//       // BitId.toString(),
//       id,
//       { status },
//       { new: true }
//     );
//     console.log(updatedBit);
//     if (!updatedBit) {
//       return res.status(404).json({ error: "Bit not found" });
//     }

//     res.status(200).json(updatedBit);
//   } catch (error) {
//     console.error("Error updating bit status:", error);
//     res.status(500).json({ error: "Failed to update bit status" });
//   }
// });


app.patch("/bitUpdate/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  // Log the BitId and action to check values (Optional logging for debugging)
  //console.log("BitId:", id);
  //console.log("Action:", action);

  // Validate the action to allow "approve", "reject", or "progress"
  if (!action || !["approve", "reject", "progress", "complete"].includes(action)) {
    return res
      .status(400)
      .json({ error: 'Invalid action. Use "approve", "reject", "progress", or "complete".' });
  }

  // Check if id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Bit ID" });
  }

  try {
    // Map the action to the corresponding status
    const status =
      action === "approve"
        ? "Approved"
      :action === "complete"
        ? "Completed"
        : action === "reject"
        ? "Rejected"
        : "In Progress"; 

    // Update the document's status based on the action
    const updatedBit = await Bit.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBit) {
      return res.status(404).json({ error: "Bit not found" });
    }

    res.status(200).json(updatedBit);
  } catch (error) {
    console.error("Error updating bit status:", error);
    res.status(500).json({ error: "Failed to update bit status" });
  }
});


// add by juwel
app.delete("/bit/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Bit.findByIdAndDelete(id);
    res.send(result);
  } catch (error) {
    console.error("Error creating gig:", error);
    res.status(500).send({ message: "Error delete gig" });
  }
});

// POST: Submit a new rating

app.post("/reviewRating", async (req, res) => {
  const { freelancerId, clientId, rating, review } = req.body;

  try {
    const newRating = new Rating({ freelancerId, clientId, rating, review });
    await newRating.save();
    res.status(201).json({ message: "Review submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting review", error });
  }
});

// GET: Get all ratings for a freelancer
app.get("/freelancers/:freelancerId/ratings", async (req, res) => {
  const { freelancerId } = req.params;

  try {
    const ratings = await Rating.find({ freelancerId }).sort({ createdAt: -1 });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
});

// GET: Get average rating for a freelancer
app.get("/average/:freelancerId", async (req, res) => {
  try {
    const ratings = await Rating.find({
      freelancerId: req.params.freelancerId,
    });
    const average =
      ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length;
    res.status(200).json({ average: isNaN(average) ? 0 : average });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all projects
// app.get('/api/projects', async (req, res) => {
//   try {
//     const projects = await Project.find();
//     res.json(projects);
//     // console.log(projects);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching projects' });
//   }
// });

// Update a project
// app.put('/api/projects/:id', async (req, res) => {
//   try {
//     const updatedProject = await Project.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     io.emit('updateProject', updatedProject); // Emit the update to all clients
//     res.json(updatedProject);
//   } catch (error) {res.status(500).json({ error: 'Error updating project' });
// }
// });
// Socket.IO connection
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// Basic health check route
app.get("/", (req, res) => {
  res.send("ProLance is running");
});

// Start the server
app.listen(port, () => {
  console.log(`ProLance is running on port: ${port}`);
});
