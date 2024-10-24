require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const req = require("express/lib/request");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY)
const port = process.env.PORT || 3000;
// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://statuesque-crisp-19f8fb.netlify.app",
    "https://prolance-e1eab.web.app",
    "https://prolance-e1eab.firebaseapp.com",
    "https://prolance-482df.web.app",
    "https://prolance-482df.firebaseapp.com",
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
  seller_image: { type: String, required: true  },
  seller_name: { type: String, required: true },
});


// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String, required: true },
  password: { type: String },
  role: { type: String },
  description:{type:String},
  password: { type: String, },
  role: { type: String, },
});
// New user nested schema

// const newUserSchema = new mongoose.Schema({
//   userInfo: [
//     {
//       name: { type: String, required: true },
//       email: { type: String, required: true, unique: true },
//       photoURL: { type: String, required: true },
//       password: { type: String, required: true },
//       role: { type: String, required: true },
//     },
//   ],

//   rating: [
//     {
//       freelancerId: { type: String, required: false },

//       clientId: { type: String, required: false },
//       rating: { type: Number, required: true, min: 1, max: 5 },
//       review: { type: String, required: true },
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
//   skills: [
//     {
//       category: { type: String, required: true }, // Category name
//       skills: [{ type: String, required: true }], // List of skills under the category
//     },
//   ],
//   qualifications: [
//     {
//       education: { type: String, required: true },
//       level: { type: String, required: true },
//       schoolName: { type: String, required: true },
//     },
//   ],
// });

// check purpose 
// Rating Schema
const ratingsSchema = new Schema({
  averageRating: { type: Number, required: true, min: 0, max: 5 }, // Rating should be between 0 and 5
  reviewsCount: { type: Number, required: true, default: 0 },
  individualRatings: [
    {
      rating: { type: Number, required: true, min: 1, max: 5 },
      review: { type: String },
      reviewer: { type: Schema.Types.ObjectId, ref: 'Users' }, // Reference to reviewer (another user)
    }
  ]
});

// Skill Schema
const skillsSchema = new Schema({
  name: { type: String, required: true },
  proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
});

// Qualification Schema
const qualificationsSchema = new Schema({
  title: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() }, // Validation for year
});

// Education Schema
const educationsSchema = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  yearOfGraduation: { type: Number, required: true, min: 1900, max: new Date().getFullYear() }, // Validation for year
});

// Language Schema
const languagesSchema = new Schema({
  language: { type: String, required: true },
  proficiency: { type: String, enum: ['Basic', 'Conversational', 'Fluent', 'Native'], required: true },
});

// Main Users Schema
const newUserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photoURL: { type: String, required: true }, // Profile picture URL
    role: { type: String, default: 'user' }, // User role, default is 'user'
    
    // Nested Schemas
    ratings: ratingsSchema, // Embeds rating schema
    skills: [skillsSchema], // Array of skills
    qualifications: [qualificationsSchema], // Array of qualifications
    education: [educationsSchema], // Array of education
    languages: [languagesSchema], // Array of languages
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);




// paymentSchema by kamrul 

const paymentSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: false },
  seller_email: { type: String, required: false },
  bit_title: { type: String, required: false },
  price : { type : Number , require  : false },
  transactionId: { type: String, required: false  },
  date : { type: Date, default: Date.now },


})


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
// Define the category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

// Define the Education schema
// Define the Education sub-schema add by juwel
const educationSchema = new mongoose.Schema({
  education: { type: String, required: true },
  level: { type: String, required: true },
  schoolName: { type: String, required: true },
});
// Define the User schema with an array of education entries
const qualificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  education: [educationSchema], // Store multiple education entries here
});
// Mongoose Schema language add by juwel
const languageSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seller_email: { type: String, required: true },
});

// Freelancer skills Schema add by juwel
const skillSchema = new mongoose.Schema({
  category: { type: String, required: true }, // Category name
  skills: [{ type: String, required: true }], // List of skills under the category
});

const freelancerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Freelancer's email
  categories: [skillSchema], // Array of categories and their skills
  categories: [skillSchema],  // Array of categories and their skills   
});

//  Mongoose model
const Gig = mongoose.model("Gig", gigSchema);
const User = mongoose.model("User", userSchema);
const PostJob = mongoose.model("PostJob", postJobSchema); // add by juwel
const Bit = mongoose.model("Bit", bitSchema); // add  by juwel
const Payment = mongoose.model( "Payment", paymentSchema )
const Rating = mongoose.model("Rating", ratingSchema); // add by juwel
const Category = mongoose.model("Category", categorySchema); // add by juwel
const Qualification = mongoose.model("Qualification", qualificationSchema); // add by juwel
const Language = mongoose.model("Language", languageSchema); // add by juwel
const Freelancer = mongoose.model("Freelancer", freelancerSchema); // add by juwel
const NewUser = mongoose.model("NewUser", newUserSchema); // add by juwel
//const Users = mongoose.model('Users', usersSchema);// Creating juwel

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

app.delete("/userDelete/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const result = await User.findByIdAndDelete(id);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error finding user" });
  }
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
app.patch("/userEdit", async (req, res) => {
  const { name, role, id } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, role },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error });
  }
});
app.patch('/profileUpdate', async (req, res) => {
  const { description, id } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { description:description },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully', updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user', error });
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

app.get("/showgigs", async (req, res) => {
  try {
    const { search, date, delivery, category, sortPrice } = req.query;

    // Create filter object for MongoDB query
    let filter = {};

    if (search) {
      filter.$or = [
        { gig_title: { $regex: search, $options: "i" } },
        { gig_description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category; // This ensures category filtering works
    }

    if (date) {
      filter.created_at = { $gte: new Date(date) };
    }

    if (delivery) {
      // Assuming you have a delivery field in your schema
      filter.delivery_time = { $lte: parseInt(delivery) }; // Adjust field name if necessary
    }

    let sort = {};
    if (sortPrice) {
      sort.min_price = sortPrice === "asc" ? 1 : -1;
    }

    // Query MongoDB with filter
    const result = await Gig.find(filter).sort(sort);
    res.json(result);
  } catch (error) {
    res.status(500).send("Error fetching gigs");
  }
});

// add by Juwel
// app.get("/showAllGigs", async (req, res) => {
//   try {
//     const gigs = await Gig.find();
//     res.send(gigs);
//   } catch (error) {
//     console.error("Error fetching gigs show data:", error);
//     res.status(500).send({ message: "Error fetching gigs data" });
//   }
// });

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
      seller_image,
      seller_name,
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
  console.log(id);
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

//add bu juwel
// Update a job post by ID
app.put('/jobPost/:id', async (req, res) => {
  const { 
      job_title, 
      job_description, 
      max_price, 
      min_price, 
      job_image, 
      category, 
      subcategory, 
      applicationDeadline 
  } = req.body;

  try {
      // Find the job post by ID
      let jobPost = await PostJob.findById(req.params.id);
      if (!jobPost) {
          return res.status(404).json({ message: 'Job post not found' });
      }

      // Update the job post fields
      jobPost.job_title = job_title;
      jobPost.job_description = job_description;
      jobPost.max_price = max_price;
      jobPost.min_price = min_price;
      jobPost.job_image = job_image;
      jobPost.category = category;
      jobPost.subcategory = subcategory;
      jobPost.applicationDeadline = applicationDeadline;

      // Save the updated job post
      await jobPost.save();

      res.json({ message: 'Job post updated successfully', jobPost });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
  }
});
//end of bu juwel

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

app.patch("/bitUpdate/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  console.log(action)

  // Log the BitId and action to check values (Optional logging for debugging)
  // Validate the action to allow "approve", "reject", or "progress"
  if (
    !action ||
    !["approve", "reject", "progress", "complete"].includes(action)
  ) {
    return res.status(400).json({
      error:
        'Invalid action. Use "approve", "reject", "progress", or "complete".',
    });
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
        : action === "complete"
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

    console.log(updatedBit);
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

//payment route by kamrul

// add for payment dynamic bid amount
app.get("/singleBids/:id", async (req, res) => {
  const id = req.params.id;
    try {
      const results = await Bit.findById(id);
      res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching bits:", error);
      res.status(500).json({ error: "Failed to fetch bits" });
    }
  });

app.post('/create-payment-intent', async (req, res) => {
  const { price } = req.body;
  const amount = parseInt(price );
  // console.log(amount, 'amount inside the intent')

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  });

  // console.log( {paymentIntent })
  res.send({
    clientSecret: paymentIntent.client_secret
  })
});

  
app.post("/payments", async (req, res) => {
  const { name, email , seller_email ,bit_title , price , transactionId , date  } = req.body;
  // console.log( name , email )
  try {
    const payment = new Payment ({
      name,
      email,
      seller_email,
      bit_title,
      price, 
      transactionId,
      date 
     
    });
    const result = await payment.save();
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error creating user" });
  }
  
});


// app.get("/payments/:email", async (req, res) => {
//   const { email } = req.params; // Extract email from the route params
//   const seller_email = req.query.seller_email; // Assuming seller_email is coming from query params

//   try {
//     const payments = await Payment.find({
//       $or: [{ email: seller_email }, { email: email }],
//     });

//     res.send(payments);
//     console.log(payments);
//   } catch (error) {
//     res.status(500).send({ message: "An error occurred", error });
//   }
// });

app.get("/payments", async (req, res) => {
  try {
    const payment = await Payment.find({});
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching bits:", error);
    res.status(500).json({ error: "Failed to fetch bits" });
  }
});
// ge by buyer
app.get("/payments/:email", async (req, res) => {
  const email  = req.params.email;
 console.log(email)
  const query = { email: email };
  try {
    const result = await Payment.find(query);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error finding user" });
  }
});

app.get("/payment/seller/:email", async (req, res) => {
  const sellerEmail = req.params.email;

  try {
    // Find a bit by seller's email
    const payment = await Payment.find({
      seller_email: sellerEmail,
    });

    // Check if the bit exists
    if (!payment) {
      return res.status(404).json({ error: "Bit not found" });
    }

    // Send the found bit as a JSON response
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching bit:", error);
    res.status(500).json({ error: "Failed to fetch bit" });
  }
});

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

app.get("/search", async (req, res) => {
  try {
    const { keyword, category } = req.query;

    // Create a search filter based on keyword and category
    const query = {};

    // If a keyword is provided, search in the 'name' or 'services' fields
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } }, // Case-insensitive search in name
        { services: { $regex: keyword, $options: "i" } }, // Case-insensitive search in services
      ];
    }

    // If a category ID is provided, add it to the query filter
    if (category) {
      query.id = parseInt(category);
    }

    // Find the matching documents in MongoDB
    const results = await Category.find(query);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// add education by juwel
// POST route to handle education submission
app.post("/api/education", async (req, res) => {
  const { educationList, seller_email } = req.body;

  if (!educationList || educationList.length === 0 || !seller_email) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Find the user by their email
    let user = await Qualification.findOne({ email: seller_email });

    // If user doesn't exist, create a new one
    if (!user) {
      user = new Qualification({
        email: seller_email,
        education: educationList,
      });
    } else {
      // Push new education entries into the user's education array
      educationList.forEach((entry) => {
        user.education.push({
          education: entry.education,
          level: entry.level,
          schoolName: entry.schoolName,
        });
      });
    }

    // Save the user document with updated education array
    await user.save();

    res.status(200).json({
      message: "Education data saved successfully!",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving education data.", error });
  }
});
app.get("/api/education/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  try {
    const result = await Qualification.find(query);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error finding user" });
  }
});

// Route to add languages for a user
app.post("/api/languages", async (req, res) => {
  const { languages, seller_email } = req.body;

  console.log("Received languages:", languages);
  console.log("Seller email:", seller_email);

  if (!Array.isArray(languages) || languages.length === 0) {
    return res
      .status(400)
      .json({ message: "Languages must be a non-empty array." });
  }

  try {
    let languageEntry = await Language.findOne({ seller_email });
    console.log("Existing language entry:", languageEntry);

    if (!languageEntry) {
      // Make sure to include all required fields
      languageEntry = new Language({
        languages,
        seller_email,
        // Add other required fields if necessary
      });
      console.log("Creating new language entry:", languageEntry);
    } else {
      console.log("Updating existing language entry:", languageEntry);
      const existingLanguages = new Set(languageEntry.languages);
      languages.forEach((lang) => existingLanguages.add(lang));
      languageEntry.languages = Array.from(existingLanguages);
    }

    const savedLanguageEntry = await languageEntry.save();
    console.log("Saved language entry:", savedLanguageEntry);
    res.json({ addedLanguages: savedLanguageEntry.languages });
  } catch (error) {
    console.error("Error saving languages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get languages for a specific user add by juwel
app.get("/api/languages/:email", async (req, res) => {
  const email = req.params.email;
  const query = { seller_email: email };
  try {
    const result = await Language.find(query);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error finding user" });
  }
});

// Get all freelancers
app.get("/api/freelancers", async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Add or update freelancer skills add by juwel
app.post("/api/freelancers/skills", async (req, res) => {
  const { email, categories } = req.body;

  try {
    // Check if the freelancer already exists
    let freelancer = await Freelancer.findOne({ email });

    if (!freelancer) {
      // Create a new freelancer with categories and skills
      freelancer = new Freelancer({ email, categories });
    } else {
      // Update the freelancer's skills by merging existing categories with new ones
      categories.forEach((newCategory) => {
        const existingCategory = freelancer.categories.find(
          (cat) => cat.category === newCategory.category
        );

        if (existingCategory) {
          // If the category already exists, merge new skills with existing ones
          newCategory.skills.forEach((skill) => {
            if (!existingCategory.skills.includes(skill)) {
              existingCategory.skills.push(skill);
            }
          });
        } else {
          // If the category doesn't exist, add it
          freelancer.categories.push(newCategory);
        }
      });
    }

    // Save the freelancer with updated skills
    await freelancer.save();

    res.status(200).json({ message: "Skills updated successfully!" });
  } catch (error) {
    console.error("Error updating skills:", error);
    res
      .status(500)
      .json({ message: "Error updating skills. Please try again." });
  }
});
app.get("/api/skills/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  try {
    const result = await Freelancer.find(query);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error finding user" });
  }
});
// API Endpoint: Get all gigs (with optional search and filter)
app.get("/api/gigs", async (req, res) => {
  const { search = "", category = "" } = req.query;

  const query = {
    gig_title: { $regex: search, $options: "i" },
  };

  if (category) {
    query.category = category;
  }

  try {
    const gigs = await Gig.find(query);
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching gigs", error });
  }
});

//Route to create a new user
// app.post("/api/users", async (req, res) => {
//   try {
//     // Validate and sanitize the input data before creating the user
//     const { userInfo, rating, skills, qualifications } = req.body;
//     console.log(userInfo);
//     // console.log(rating);
//     // Create a new instance of the NewUser model with the incoming data
//     const newUser = new NewUser({
//       userInfo: userInfo || [],
//       rating: rating || [], // Default to an empty array if no ratings are provided
//       skills: skills || [], // Default to an empty array if no skills are provided
//       qualifications: qualifications || [], // Default to an empty array if no qualifications are provided
//     });
// console.log(newUser);
//     // Save the new user to the database
//     await newUser.save();

//     // Send a success response back to the client
//     res.status(201).json(newUser);
//   } catch (error) {
//     // Handle any errors that occur during the save operation
//     res.status(400).json({ error: error.message });
//   }
// });


// PATCH route to update rating, skills, or qualifications
app.patch("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from URL params
    const { rating, skills, qualifications } = req.body; // Data to be updated

    // Build update object
    const updateData = {};

    // Append rating if provided
    if (rating) {
      updateData.$push = { rating: rating }; // Push new rating to the array
    }

    // Append skills if provided
    if (skills) {
      updateData.$push = { skills: skills }; // Push new skills to the array
    }

    // Append qualifications if provided
    if (qualifications) {
      updateData.$push = { qualifications: qualifications }; // Push new qualifications to the array
    }

    // Update the user document using $push to add data to arrays
    const updatedUser = await NewUser.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// User Registration
app.post('/api/users', async (req, res) => {
  const { name, email, password, photoURL, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await NewUser.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new NewUser({
      name,
      email,
      password: hashedPassword,
      photoURL,
      role,
    });

    // Save the user to the database
    await newUser.save();
    console.log('User created successfully:', newUser);
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Error while registering user:', error);

    // If the error is a MongoDB duplicate key error, respond appropriately
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // For other errors, send a general server error
    res.status(500).json({ message: 'Server error' });
  }
});
// under basic server
app.get("/", (req, res) => {
  res.send("ProLance is running");
});

// Start the server
app.listen(port, () => {
  console.log(`ProLance is running on port: ${port}`);
});



