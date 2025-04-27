const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  assignee: { type: String, required: true },
  ticket: { type: String, required: true },
  comments: [{ text: String, createdAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", TaskSchema);