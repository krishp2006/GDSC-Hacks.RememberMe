const mongoose = require('mongoose');

const patientInfoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    favoriteActivities: { type: [String] },
    notableLifeEvents: { type: [String] },
    hobbies: { type: [String] },
    medicalNotes: { type: String }
});

const PatientInfo = mongoose.model('PatientInfo', patientInfoSchema);

module.exports = PatientInfo;