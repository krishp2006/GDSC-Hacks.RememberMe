const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Make sure you have GEMINI_API_KEY in your .env
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });  // or another suitable model

// Story Generation Route (needs Gemini API integration)
app.post('/generateStory', async (req, res) => {
    const { prompt, memories } = req.body;
    if (!prompt || !memories) {
        return res.status(400).json({ error: 'Prompt and memories are required' });
    }

    try {
        const combinedPrompt = `Generate a story about "${prompt}" based on these memories: ${memories.join(", ")}`;

        const result = await model.generateContent(combinedPrompt);
        const response = result.response;
        const text = response.text();

        res.json({ story: text });
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({ error: 'Failed to generate story' });
    }
});

// Person Information Retrieval Route
app.post('/getPersonInfo', async (req, res) => {
    const { personName } = req.body;
    if (!personName) {
        return res.status(400).json({ error: 'Person name is required' });
    }

    try {
        // Simulate fetching relevant memories - replace with actual logic
        const relevantMemories = ["Memory 1 about " + personName, "Memory 2 about " + personName];

        const prompt = `Based on the following memories, tell me about ${personName}: ${relevantMemories.join(", ")}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        res.json({ story: text });
    } catch (error) {
        console.error('Error retrieving person info:', error);
        res.status(500).json({ error: 'Failed to retrieve person info' });
    }
});

// The root route '/' is now handled by express.static serving index.html

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});