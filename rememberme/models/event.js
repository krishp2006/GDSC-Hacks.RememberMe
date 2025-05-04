const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    eventDescription: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now } // Optional: track creation time
});

// Ensure events are indexed by date for efficient sorting/querying
eventSchema.index({ eventDate: 1 });

module.exports = mongoose.model('Event', eventSchema);  