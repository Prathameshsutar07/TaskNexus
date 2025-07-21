import React, { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import {FaPlus,FaTimes} from "react-icons/fa";
import Lottie from "lottie-react";
import checkAnimation from "./animations/check.json";
import progressAnimation from "./animations/progress.json";
import pendingAnimation from "./animations/pending.json";
import addtaskAnimation from "./animations/addtask.json";
import notFoundAnimation from "./animations/notfound.json";


const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [ticket, setTicket] = useState("");
  const [filters, setFilters] = useState({ status: "", ticket: "", startDate: "", endDate: "" });
  const [showForm, setShowForm] = useState(false);
  const [newComment,setNewComment]=useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [download,setDownload]=useState({startDate: "", endDate: "" })


  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await axios.get("https://tasknexus-lf7a.onrender.com/api/tasks");
    setTasks(response.data);
  };

  const addTask = async () => {
    if (!taskName || !assignee || !ticket) {
      alert("Task Name, Assignee, and Ticket are required!");
      return;
    }
    await axios.post("https://tasknexus-lf7a.onrender.com/api/tasks", { taskName, assignee, ticket });
    fetchTasks();
    setTaskName("");
    setAssignee("");
    setTicket("");
    setShowForm(false);
  };

  const updateTask = async (id, newStatus) => {
    // let comment = "";
    // if (newStatus === "Completed") {
    //   comment = prompt("Please enter a comment:");
    //   if (!comment) return;
    // }
    await axios.put(`https://tasknexus-lf7a.onrender.com/api/tasks/${id}`, { status: newStatus });
    fetchTasks();
  };

  const addComment = async (id) => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty!");
      return;
    }
    try {
      const response = await axios.put(
        `https://tasknexus-lf7a.onrender.com/api/tasks/${id}/comment`,
        { comment: newComment }, // Ensure correct field name
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Comment added:", response.data);
      fetchTasks(); // Refresh tasks after adding comment
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to add comment");
    }
  };
  
  const applyFilters = async () => {
    const query = new URLSearchParams(filters).toString();
    const response = await axios.get(`https://tasknexus-lf7a.onrender.com/api/tasks?${query}`);
    setTasks(response.data);
  };

  const downloadReport = async () => {
    try {
      const startDate =download.startDate; // Example: Replace with actual values
      const endDate = download.endDate;// Today’s date
  
      const response = await axios.get(
        `https://tasknexus-lf7a.onrender.com/api/tasks/report?startDate=${startDate}&endDate=${endDate}`,
        { responseType: "blob" } // Correct response type for Excel
      );
  
      if (response.status === 200) {
        saveAs(response.data, "tasks_report.xlsx");
        console.log("Report downloaded successfully!");
      } else {
        console.error("Failed to download report:", response.data);
        alert("Failed to generate report");
      }
    } catch (error) {
      console.error("Error downloading report:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error generating report");
    }
  };
  
  const formatDate = (isoString) => {
    if (!isoString) return ""; // Handle undefined/null cases
    const date = new Date(isoString);
    return date.toLocaleString(); // Converts to readable format
  };
  const getAnimation = (status) => {
    switch (status) {
      case "Completed":
        return checkAnimation;
      case "In Progress":
        return progressAnimation;
      default:
        return pendingAnimation;
    }
  };
  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    await axios.delete(`https://tasknexus-lf7a.onrender.com/api/tasks/${id}`);
    fetchTasks();
  };


  return (
    <div className="p-6 mx-auto">

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap gap-4 items-center justify-between">
        {/* Start Date Input */}
        <p><h1 className="text-2xl font-bold mt-2">TaskNexus</h1></p>

        <input
          type="date"
          onChange={(e) => {
            const date = new Date(e.target.value);
            date.setHours(0, 0, 0, 0); // Start of the day
            setFilters({ ...filters, startDate: date.toISOString() });
            setDownload({...download,startDate: date.toISOString() });

          }}
          className="border p-2 rounded-md w-full md:w-1/5 focus:ring focus:ring-blue-30"
        />

        {/* End Date Input */}
        <input
          type="date"
          onChange={(e) => {
            const date = new Date(e.target.value);
            date.setHours(23, 59, 59, 999); // End of the day
            setFilters({ ...filters, endDate: date.toISOString() });
            setDownload({...download,endDate: date.toISOString() });

          }}
          className="border p-2 rounded-md w-full md:w-1/5 focus:ring focus:ring-blue-30"
        />
        <select onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border p-2 rounded-md m-2 focus:ring focus:ring-blue-30">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <input type="text" placeholder="Ticket" onChange={(e) => setFilters({ ...filters, ticket: e.target.value })} className="border rounded-md p-2 m-2 focus:ring focus:ring-blue-30" />
        <button onClick={applyFilters} className="bg-green-500 text-white p-2 rounded ">Apply Filters</button>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-400 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          
        >
          <Lottie animationData={addtaskAnimation} className="w-6 h-6" loop={true} />
          Create Task
        </button>
      </div>
      {showForm &&
     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
     <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
       
       {/* Close Button */}
       <button 
         onClick={() => setShowForm(false)}
         className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
       >
         <FaTimes size={20} />
       </button>

       {/* Animation */}
       <div className="flex justify-center">
         <Lottie animationData={addtaskAnimation} className="w-32 h-32" loop />
       </div>

       {/* Form Inputs */}
       <div className="flex flex-col gap-3">
         <input
           type="text"
           placeholder="Task Name"
           value={taskName}
           onChange={(e) => setTaskName(e.target.value)}
           className="border p-3 rounded-md shadow-sm focus:ring focus:ring-blue-300"
         />
         
         <input
           type="text"
           placeholder="Assignee"
           value={assignee}
           onChange={(e) => setAssignee(e.target.value)}
           className="border p-3 rounded-md shadow-sm focus:ring focus:ring-blue-300"
         />
         
         <input
           type="text"
           placeholder="Ticket"
           value={ticket}
           onChange={(e) => setTicket(e.target.value)}
           className="border p-3 rounded-md shadow-sm focus:ring focus:ring-blue-300"
         />
       </div>

       {/* Add Task Button */}
       <div className="flex justify-center mt-4">
         <button
           onClick={() => {
             addTask();
             setShowForm(false); // Close modal after adding task
           }}
           className="bg-green-500 text-white px-5 py-3 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all shadow-md"
         >
           <FaPlus className="text-lg" /> Add Task
         </button>
       </div>

     </div>
   </div>

      }

      {/* Task List */}
      <div className="mt-6 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-lg font-semibold flex items-center justify-center">
  {tasks.length <= 0 ? (
    <div className="flex flex-col items-center justify-center w-full">
      <Lottie animationData={notFoundAnimation} className="w-32 h-32" />
      <p className="text-gray-500 mt-2">No Tasks Found</p>
    </div>
  ) : (
    `Task List (${tasks.length})`
  )}
</h2>
      {tasks.map((task) => (
        <div
          key={task._id}
          className="border p-4 mb-4 rounded-lg flex justify-between items-center bg-gray-50 hover:shadow-md transition-all duration-300 cursor-pointer"
          onClickCapture={(e) => {
            // Ensure modal only opens if clicking outside select and button elements
            if (!e.target.closest("select") && !e.target.closest("button")) {
              setSelectedTask(task);
            }
          }}
        >


          <div className="flex items-center gap-4">
            <Lottie animationData={getAnimation(task.status)} className="w-14 h-14" />
            <div>
              <p className="text-lg font-medium">{task.taskName}</p>
              <p className="text-sm text-gray-600">Assignee: {task.assignee} | Ticket: {task.ticket}</p>
              <p className="text-xs text-gray-500 mt-1">
                Latest Comment: {task.comments.length ? task.comments[task.comments.length - 1].text : "No comments"}
              </p>
              {task.comments.length > 0 && (
                <small className="text-gray-400">
                  Commented On: {formatDate(task.comments[task.comments.length - 1]?.createdAt)}
                </small>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-400 mb-2">CD: {formatDate(task.createdAt)}</p>
            <select
              onChange={(e) => {
                e.stopPropagation();
                updateTask(task._id, e.target.value);
              }}
              className="border p-2 rounded-lg text-sm bg-white focus:ring focus:ring-blue-200"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button onClick={(e) => {
                e.stopPropagation(); deleteTask(task._id)} }className="bg-red-500 text-white p-2 rounded mt-2">Delete</button>

          </div>
        </div>
      ))}
    </div>

      {selectedTask && (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" onClick={() => setSelectedTask(null)}>
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-3/5 max-w-3xl relative" onClick={(e) => e.stopPropagation()}>
      {/* Close Button */}
      <button 
        onClick={() => setSelectedTask(null)} 
        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
      >
        ✖
      </button>

      {/* Task Title */}
      <h2 className="text-3xl font-bold text-gray-800 text-center border-b pb-3">{selectedTask.taskName}</h2>

      {/* Task Details */}
      <div className="grid grid-cols-3 gap-6 bg-gray-100 p-4 rounded-lg mt-4 text-gray-700 text-center">
        <p><span className="font-semibold">Status:</span> {selectedTask.status}</p>
        <p><span className="font-semibold">Assignee:</span> {selectedTask.assignee}</p>
        <p><span className="font-semibold">Ticket:</span> {selectedTask.ticket}</p>
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Comments:</h3>
        <div className="max-h-40 overflow-y-auto border border-gray-300 p-4 rounded-lg bg-gray-50">
          {selectedTask.comments.length > 0 ? (
            <ul>
              {selectedTask.comments.map((comment, index) => (
                <li key={index} className="border-b last:border-none py-2 text-gray-700">
                  <span className="block font-medium">{comment.text}</span>
                  <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No comments yet.</p>
          )}
        </div>
      </div>

      {/* Add Comment Input */}
      <div className="mt-6 flex items-center gap-3">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border border-gray-300 p-3 flex-grow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => addComment(selectedTask._id)}
          className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-all shadow-md"
        >
          Add
        </button>
      </div>
    </div>
  </div>
)}



      {/* Download Report */}
      <div className="mt-4">
        <button onClick={downloadReport} className="bg-purple-500 text-white p-2 rounded">Download Report</button>
      </div>


    </div>
  
  );
};

export default TaskManager;
