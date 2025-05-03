const express = require('express');
const router = express.Router();
const Memory = require('../models/memory.model');

router.get('/', async (req, res) => {
  try {
    const memories = await Memory.find();
    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const memory = new Memory({
    personName: req.body.personName,
    relationship: req.body.relationship,
    memoryText: req.body.memoryText,
    tags: req.body.tags
  });

  try {
    const newMemory = await memory.save();
    res.status(201).json(newMemory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Middleware to get memory by ID
async function getMemory(req, res, next) {
    let memory;
    try {
        memory = await Memory.findById(req.params.id);
        if (memory == null) {
            return res.status(404).json({ message: 'Cannot find memory' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.memory = memory; // Attach memory to response object
    next();
}

// GET one memory (optional, but useful for editing)
router.get('/:id', getMemory, (req, res) => {
    res.json(res.memory);
});


// PUT update a memory
router.put('/:id', getMemory, async (req, res) => {
    if (req.body.personName != null) {
        res.memory.personName = req.body.personName;
    }
    if (req.body.relationship != null) {
        res.memory.relationship = req.body.relationship;
    }
    if (req.body.memoryText != null) {
        res.memory.memoryText = req.body.memoryText;
    }
     if (req.body.tags != null) { // Allow updating tags
        res.memory.tags = req.body.tags;
    }
    try {
        const updatedMemory = await res.memory.save();
        res.json(updatedMemory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a memory
router.delete('/:id', getMemory, async (req, res) => {
    try {
        await res.memory.remove();
        res.json({ message: 'Deleted Memory' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;