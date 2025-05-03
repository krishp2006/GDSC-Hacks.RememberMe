const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  personName: { type: String, required: true },
  relationship: { type: String, required: true },
  memoryText: { type: String, required: true },
  tags: { type: [String] }
});

const Memory = mongoose.model('Memory', memorySchema);

module.exports = Memory;