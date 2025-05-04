const express = require('express');
const router = express.Router();
const Event = require('../models/event'); // Import the Event model

// === GET all events, sorted by nearest upcoming date ===
router.get('/', async (req, res) => {
    try {
        const now = new Date(); // Get the current date/time
        // Query events with dates today or later, sorted earliest first
        const events = await Event.find({ eventDate: { $gte: now } }).sort({ eventDate: 'asc' });
        res.json(events); // Return found events as JSON
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ message: err.message }); // Return error response
    }
});

// === GET up to 3 upcoming events for homepage display ===
router.get('/upcoming', async (req, res) => {
    try {
        const now = new Date(); // Current timestamp
        // Find next 3 events from now into the future
        const upcomingEvents = await Event.find({ eventDate: { $gte: now } })
            .sort({ eventDate: 'asc' })
            .limit(3); // Limit to 3 entries
        res.json(upcomingEvents); // Send results
    } catch (err) {
        console.error("Error fetching upcoming events:", err);
        res.status(500).json({ message: err.message });
    }
});

// === POST a new event to the database ===
router.post('/', async (req, res) => {
    const { eventName, eventDate, eventDescription } = req.body;

    // Basic validation for required fields
    if (!eventName || !eventDate) {
        return res.status(400).json({ message: 'Event name and date are required.' });
    }

    // Create a new Event instance
    const event = new Event({ eventName, eventDate, eventDescription });

    try {
        const newEvent = await event.save(); // Save event to database
        res.status(201).json(newEvent); // Respond with the saved event
    } catch (err) {
        res.status(400).json({ message: err.message }); // Validation or save failure
    }
});

// Future expansion: PUT (edit) and DELETE routes can be added here

module.exports = router; // Export the router for use in server.js
