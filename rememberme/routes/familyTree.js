const express = require('express');
const router = express.Router();
const FamilyTree = require('../models/familyTree.model'); // Import the FamilyTree Mongoose model

// === GET all family members ===
router.get('/', async (req, res) => {
  try {
    // Fetch all documents from the FamilyTree collection
    const familyTree = await FamilyTree.find();
    res.json(familyTree); // Respond with the list as JSON
  } catch (err) {
    // Handle errors (e.g., database issues)
    res.status(500).json({ message: err.message });
  }
});

// === POST a new family member ===
router.post('/', async (req, res) => {
  // Create a new FamilyTree document using request body
  const familyTree = new FamilyTree({
    personName: req.body.personName,
    relationship: req.body.relationship
  });

  try {
    // Save the new document to MongoDB
    const newFamilyTree = await familyTree.save();
    // Return the created object with a 201 Created status
    res.status(201).json(newFamilyTree);
  } catch (err) {
    // Handle validation or save errors
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; // Export the router for use in server.js
