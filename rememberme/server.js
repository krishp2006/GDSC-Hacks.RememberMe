const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to allow cross-origin requests and parse JSON request bodies
app.use(cors());
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

// Connect to MongoDB using URI from .env
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connection established'))
    .catch(err => console.log('MongoDB connection error:', err));

// === ROUTES SETUP ===
const familyTreeRoutes = require('./routes/familyTree');
const memoryRoutes = require('./routes/memory');
const patientInfoRoutes = require('./routes/patientInfo');
const eventRoutes = require('./routes/events');

app.use('/familyTree', familyTreeRoutes);   // Routes for family member data
app.use('/memory', memoryRoutes);           // Routes for memories
app.use('/events', eventRoutes);            // Routes for events
app.use('/patientInfo', patientInfoRoutes); // Routes for patient information

// === GEMINI AI SETUP ===
// Instantiate the Gemini API client using the key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// === Route: Generate Person Description from Memories ===
app.post('/getPersonInfo', async (req, res) => {
    const { personName } = req.body;

    // Validate input
    if (!personName) {
        return res.status(400).json({ error: 'Person name is required' });
    }

    try {
        const Memory = require('./models/memory');

        // Find memories for the given person
        const relevantMemories = await Memory.find({ personName: personName }).select('memoryText').exec();
        const memoryContents = relevantMemories.map(memory => memory.memoryText);

        if (memoryContents.length === 0) {
            return res.status(404).json({ error: 'No memories found for this person.' });
        }

        // Create prompt for Gemini based on memories
        const prompt = `Based on the following memories, tell me about ${personName}: ${memoryContents.join(", ")}`;

        let result;
        try {
            // Use Gemini to generate the story
            result = await model.generateContent(prompt);
        } catch (geminiError) {
            console.error('Gemini API Error:', geminiError);
            return res.status(500).json({ error: 'Error communicating with the Gemini API.' });
        }

        // Extract text from Gemini's response
        const response = result.response;
        const text = response.text();

        res.json({ story: text });

    } catch (error) {
        console.error('Error retrieving person info:', error);
        res.status(500).json({ error: 'Failed to retrieve person info' });
    }
});

// === Route: Get Random Memory Highlight (compassionate reminder) ===
app.get('/getRandomMemoryHighlight', async (req, res) => {
    try {
        const Memory = require('./models/memory');

        // Count how many memories are in the database
        const count = await Memory.countDocuments();
        if (count === 0) {
            return res.json({ highlight: "No memories found yet. Please add one!" });
        }

        // Pick a random memory
        const randomIndex = Math.floor(Math.random() * count);
        const randomMemory = await Memory.findOne().skip(randomIndex);

        // Ensure all required fields are present
        if (!randomMemory || !randomMemory.memoryText || !randomMemory.personName || !randomMemory.relationship) {
            return res.json({ highlight: "Incomplete memory found. Please add a complete memory." });
        }

        // Create a prompt for Gemini to rephrase the memory
        const prompt = `Rephrase the following memory into a compassionate, uplifting reminder. Start with 'Remember when...'. Memory: "${randomMemory.memoryText}" with ${randomMemory.personName} (${randomMemory.relationship}).`;

        // Default fallback message
        let highlightText = `Remember when you ${randomMemory.memoryText} with ${randomMemory.personName}?`;

        try {
            // Generate rephrased highlight using Gemini
            const result = await model.generateContent(prompt);
            highlightText = result.response.text();
        } catch (geminiError) {
            console.warn('Gemini fallback used:', geminiError.message);
        }

        res.json({ highlight: highlightText });

    } catch (error) {
        // Final fallback error message
        res.status(500).json({ error: 'Failed to get memory highlight *THIS IS WIP* NOT WORKING' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
