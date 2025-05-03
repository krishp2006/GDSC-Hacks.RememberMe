const express = require('express');
const router = express.Router();
const PatientInfo = require('../models/patientInfo.model');

router.get('/', async (req, res) => {
  try {
    const patientInfo = await PatientInfo.find();
    res.json(patientInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST/PUT - Create or Update Patient Info (Upsert logic)
// We'll use POST for simplicity on the frontend, but handle it like an upsert here.
// A more RESTful approach would use PUT /patientInfo/:id or PUT /patientInfo/main
router.post('/', async (req, res) => {
    const filter = {}; // Find any existing document (assuming only one)
    const update = {
        name: req.body.name,
        age: req.body.age,
        favoriteActivities: req.body.favoriteActivities,
        notableLifeEvents: req.body.notableLifeEvents,
        hobbies: req.body.hobbies,
        medicalNotes: req.body.medicalNotes
    };
    const options = {
        new: true, // Return the modified document rather than the original
        upsert: true // Create a new document if no documents match the filter
    };

    try {
        // Find the first document and update it, or create if it doesn't exist
        const updatedPatientInfo = await PatientInfo.findOneAndUpdate(filter, update, options);
        res.status(updatedPatientInfo ? 200 : 201).json(updatedPatientInfo); // 200 OK if updated, 201 Created if upserted
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;