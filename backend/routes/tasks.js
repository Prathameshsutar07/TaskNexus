const express=require('express');
const { getTasks, createTask, updateTask, generateReport, updateLatestComment,deleteTask } = require('../controllers/taskController');
const router = express.Router();


router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.put('/tasks/:id/comment', updateLatestComment); // Change endpoint for comments
router.get('/tasks/report', generateReport);
router.delete('/tasks/:id', deleteTask);

module.exports = router;
