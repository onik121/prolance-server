require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // Added mongoose for MongoDB connection
const { Server } = require("socket.io");
const http = require("http");
const Message = require("./models/Message"); // Import Message model
const messageRoutes = require("./routes/messages"); // Import message routes

const app = express();
const port = process.env.PORT || 5000;

// Middleware
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

// MongoDB Connection using mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://myUser:${process.env.DB_PASS}@cluster0.0yjrwty.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit if DB connection fails
  }
};

connectDB();

// Routes
app.use('/api/messages', messageRoutes); // Add message-related routes

app.get("/", (req, res) => {
  res.send("ProLance is running");
});

// Initialize HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ],
    // origin: 'http://localhost:3000', // Adjust to match frontend URL
    methods: ['GET', 'POST'],
  },
});

// Handle real-time messaging with Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Receive message and save to DB
  socket.on('sendMessage', async (data) => {
    const { sender, receiver, message } = data;

    try {
      const newMessage = new Message({ sender, receiver, message });
      await newMessage.save();

      // Broadcast message to all clients
      io.emit('receiveMessage', newMessage);
    } catch (error) {
      console.error('Error saving message:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`ProLance is running on http://localhost:${port}`);
});
