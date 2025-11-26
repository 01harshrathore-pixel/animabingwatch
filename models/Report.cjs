  // models/Report.cjs - UPDATED VERSION
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Episode Report Fields
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime'
  },
  episodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Episode'
  },
  episodeNumber: Number,
  issueType: {
    type: String,
    enum: ['Link Not Working', 'Wrong Episode', 'Poor Quality', 'Audio Issue', 'Subtitle Issue', 'Other'],
    required: false
  },
  
  // Contact Form Fields
  name: String,
  email: {
    type: String,
    required: true
  },
  subject: String,
  message: {
    type: String,
    required: true
  },
  
  // Common Fields
  type: {
    type: String,
    enum: ['episode', 'contact'],
    default: 'episode',
    required: true
  },
  username: {
    type: String,
    default: 'Anonymous'
  },
  userIP: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Fixed', 'Invalid'],
    default: 'Pending'
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  adminResponse: String,
  responseDate: Date
}, { 
  timestamps: true 
});

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);
