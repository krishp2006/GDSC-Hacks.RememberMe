const express = require('express');
const router = express.Router();
const PatientInfo = require('../models/patientInfo.model'); // Import PatientInfo Mongoose model

// === GET patient information ===
router.get('/', async (req, res) => {
  try {
    // Fetch all patient info documents (you likely only store one)
    const patientInfo = await PatientInfo.find();
    res.json(patientInfo);
  } catch (err) {
    // Handle any server/database error
    res.status(500).json({ message: err.message });
  }
});

// === POST/PUT patient info (Upsert logic) ===
// This route handles both creation and update in a single call.
// It's designed to update the first patient info document found,
// or create one if it doesn't exist (using `upsert: true`).
router.post('/', async (req, res) => {
  const filter = {}; // No specific filter, assumes one patient info document in the DB
  const update = {
    name: req.body.name,
    age: req.body.age,
    favoriteActivities: req.body.favoriteActivities,
    notableLifeEvents: req.body.notableLifeEvents,
    hobbies: req.body.hobbies,
    medicalNotes: req.body.medicalNotes
  };
  const options = {
    new: true,        // Return the updated document
    upsert: true      // Create a new document if none is found
  };

  try {
    // Perform the upsert operation
    const updatedPatientInfo = await PatientInfo.findOneAndUpdate(filter, update, options);
    res.status(updatedPatientInfo ? 200 : 201).json(updatedPatientInfo); // Respond based on action type
  } catch (err) {
    // Handle validation or save errors
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
