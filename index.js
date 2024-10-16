require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const req = require("express/lib/request");
const port = process.env.PORT || 5001;
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
    "https://prolance-482df.firebaseapp.com"
    
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
  seller_image: { type: String, required: true },
  seller_name: { type: String, required: true },
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String, required: true },
  password: { type: String, },
  role: { type: String, },
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
  schoolName: { type: String, required: true }
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
  skills: [{ type: String, required: true }],  // List of skills under the category
});

const freelancerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Freelancer's email
  categories: [skillSchema],  // Array of categories and their skills
});

// Models
const Gig = mongoose.model("Gig", gigSchema);
const User = mongoose.model("User", userSchema);
const PostJob = mongoose.model("PostJob", postJobSchema); // add by juwel
const Bit = mongoose.model("Bit", bitSchema); // add  by juwel
const Rating = mongoose.model("Rating", ratingSchema); // add by juwel
const Category = mongoose.model('Category', categorySchema); // add by juwel
const Qualification = mongoose.model('Qualification', qualificationSchema); // add by juwel
const Language = mongoose.model('Language', languageSchema); // add by juwel
const Freelancer = mongoose.model('Freelancer', freelancerSchema); // add by juwel
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
    const result = await User.findByIdAndDelete(id)
    res.send(result)
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error finding user" });

  }
})
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
app.patch('/userEdit', async (req, res) => {
  const { name, role, id } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, role },
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

app.get('/showgigs', async (req, res) => {
  try {
    const { search, date, delivery, category, sortPrice } = req.query;



    // Create filter object for MongoDB query
    let filter = {};


    if (search) {


      filter.$or = [

        { gig_title: { $regex: search, $options: 'i' } },
        { gig_description: { $regex: search, $options: 'i' } }
      ];


    }
    if (category) {
      filter.category = category;
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
      seller_name
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
  console.log(id)
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

app.patch("/bitUpdate/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  // Log the BitId and action to check values (Optional logging for debugging)
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

    console.log(updatedBit)
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

app.get('/search', async (req, res) => {
  try {
    const { keyword, category } = req.query;

    // Create a search filter based on keyword and category
    const query = {};

    // If a keyword is provided, search in the 'name' or 'services' fields
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } }, // Case-insensitive search in name
        { services: { $regex: keyword, $options: 'i' } }, // Case-insensitive search in services
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
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// add education by juwel
// POST route to handle education submission
app.post('/api/education', async (req, res) => {
  const { educationList, seller_email } = req.body;

  if (!educationList || educationList.length === 0 || !seller_email) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Find the user by their email
    let user = await Qualification.findOne({ email: seller_email });

    // If user doesn't exist, create a new one
    if (!user) {
      user = new Qualification({ email: seller_email, education: educationList });
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
      message: 'Education data saved successfully!',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving education data.', error });
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

// Route to add languages for a user
app.post('/api/languages', async (req, res) => {
  const { languages, seller_email } = req.body;
  
  try {
    // Find the existing language entry for the user
    let languageEntry = await Language.findOne({ seller_email });
    
    // If it doesn't exist, create a new one
    if (!languageEntry) {
      languageEntry = new Language({ languages, seller_email });
    } else {
      // Add new languages, ensuring no duplicates
      const existingLanguages = new Set(languageEntry.languages);
      languages.forEach(lang => existingLanguages.add(lang));
      languageEntry.languages = Array.from(existingLanguages);
    }

    // Save the entry
    await languageEntry.save();
    res.json({ addedLanguages: languageEntry.languages });
  } catch (error) {
    console.error('Error adding languages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all freelancers
app.get('/api/freelancers', async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add or update freelancer skills add by juwel
app.post('/api/freelancers/skills', async (req, res) => {
  const { email, categories } = req.body;

  try {
    // Check if the freelancer already exists
    let freelancer = await Freelancer.findOne({ email });

    if (!freelancer) {
      // Create a new freelancer with categories and skills
      freelancer = new Freelancer({ email, categories });
    } else {
      // Update the freelancer's skills by merging existing categories with new ones
      categories.forEach(newCategory => {
        const existingCategory = freelancer.categories.find(
          (cat) => cat.category === newCategory.category
        );

        if (existingCategory) {
          // If the category already exists, merge new skills with existing ones
          newCategory.skills.forEach(skill => {
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

    res.status(200).json({ message: 'Skills updated successfully!' });
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({ message: 'Error updating skills. Please try again.' });
  }
});
app.get('/api/skills/:email', async (req, res) => {
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

// under basic server
app.get("/", (req, res) => {
  res.send("ProLance is running");
});

// Start the server
app.listen(port, () => {
  console.log(`ProLance is running on port: ${port}`);
});
