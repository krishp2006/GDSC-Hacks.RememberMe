const mongoose = require('mongoose');

const familyTreeSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  relationship: { type: String, required: true }
});

const FamilyTree = mongoose.model('FamilyTree', familyTreeSchema);

module.exports = FamilyTree;