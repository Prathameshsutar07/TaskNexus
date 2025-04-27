const excelJS = require('exceljs');

module.exports = async (tasks) => {
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tasks Report');

  worksheet.columns = [
    { header: 'Date Created', key: 'createdAt', width: 20 },
    { header: 'Task Name', key: 'taskName', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Assignee', key: 'assignee', width: 20 },
    { header: 'Ticket', key: 'ticket', width: 20 },
    { header: 'Latest Comment', key: 'latestComment', width: 40 }
  ];

  tasks.forEach(task => {
    worksheet.addRow({ 
      createdAt: task.createdAt.toISOString().split('T')[0],
      taskName: task.taskName,
      status: task.status,
      assignee: task.assignee,
      ticket: task.ticket,
      latestComment: task.comments.length ? task.comments[task.comments.length - 1].text : ''
    });
  });

  return workbook.xlsx.writeBuffer();
};
