const express = require('express');
const router = express.Router();
const Memory = require('../models/memory.model'); // Import the Memory Mongoose model
const mongoose = require('mongoose');

// === GET all memories ===
router.get('/', async (req, res) => {
    try {
        // Retrieve all memory documents from the database
        const memories = await Memory.find();
        res.json(memories);
    } catch (err) {
        // Handle database read errors
        res.status(500).json({ message: err.message });
    }
});

// === POST a new memory ===
router.post('/', async (req, res) => {
    // Create a new memory document with provided data
    const memory = new Memory({
        personName: req.body.personName,
        relationship: req.body.relationship,
        memoryText: req.body.memoryText,
        tags: req.body.tags
    });

    try {
        // Save the new memory document to the database
        const newMemory = await memory.save();
        res.status(201).json(newMemory); // Return the saved document
    } catch (err) {
        // Handle validation or save errors
        res.status(400).json({ message: err.message });
    }
});

// === Middleware: Find memory by ID ===
async function getMemory(req, res, next) {
    let memory;
    try {
        // Try to find a memory document by the provided ID
        memory = await Memory.findById(req.params.id);
        if (memory == null) {
            // Memory not found
            return res.status(404).json({ message: 'Cannot find memory' });
        }
    } catch (err) {
        // Handle invalid ID or DB errors
        return res.status(500).json({ message: err.message });
    }
    res.memory = memory; // Attach found memory to response object for use in next middleware
    next();
}

// === GET one memory by ID ===
router.get('/:id', getMemory, (req, res) => {
    // Return the memory found by getMemory middleware
    res.json(res.memory);
});

// === PUT update a memory ===
router.put('/:id', getMemory, async (req, res) => {
    // Update fields only if they are provided in the request
    if (req.body.personName != null) {
        res.memory.personName = req.body.personName;
    }
    if (req.body.relationship != null) {
        res.memory.relationship = req.body.relationship;
    }
    if (req.body.memoryText != null) {
        res.memory.memoryText = req.body.memoryText;
    }
    if (req.body.tags != null) {
        res.memory.tags = req.body.tags;
    }

    try {
        // Save and return the updated document
        const updatedMemory = await res.memory.save();
        res.json(updatedMemory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// === DELETE a memory ===
router.delete('/:id', getMemory, async (req, res) => {
    try {
        // Remove the memory document from the database
        await res.memory.remove();
        res.json({ message: 'Deleted Memory' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
