const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connection established'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
const familyTreeRoutes = require('./routes/familyTree');
const memoryRoutes = require('./routes/memory');
const patientInfoRoutes = require('./routes/patientInfo');

app.use('/familyTree', familyTreeRoutes);
app.use('/memory', memoryRoutes);
app.use('/patientInfo', patientInfoRoutes);

// The root route '/' is now handled by express.static serving index.html

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});