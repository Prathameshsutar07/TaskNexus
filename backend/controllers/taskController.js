const Task = require("../models/Task");
const generateExcel = require("../utils/reportGenerator");

exports.getTasks = async (req, res) => {
  try {
    const { status, ticket, startDate, endDate } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (ticket) filter.ticket = ticket;

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Set time to 00:00:00

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set time to 23:59:59

      filter.createdAt = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const update = { status };
    if (status === "Completed" && comment) {
      update.$push = { comments: { text: comment, createdAt: new Date() } };
    }
    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLatestComment = async (req, res) => {
  try {

    const { comment } = req.body;
    if (!comment) return res.status(400).json({ message: "Comment cannot be empty" });

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text: comment, createdAt: new Date() } } },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    console.error("Error updating comment:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Ensure full range

    const tasks = await Task.find({ createdAt: { $gte: start, $lte: end } });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for the given date range" });
    }

    const fileBuffer = await generateExcel(tasks);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="tasks_report.xlsx"');

    res.send(fileBuffer);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

