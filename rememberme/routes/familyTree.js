const express = require('express');
const router = express.Router();
const FamilyTree = require('../models/familyTree.model');

router.get('/', async (req, res) => {
  try {
    const familyTree = await FamilyTree.find();
    res.json(familyTree);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const familyTree = new FamilyTree({
    personName: req.body.personName,
    relationship: req.body.relationship
  });

  try {
    const newFamilyTree = await familyTree.save();
    res.status(201).json(newFamilyTree);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;