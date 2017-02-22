export default class TaskManager {
  constructor() {
    this.currentTasks = [];
  }

  getAllTasks() {
    return this.currentTasks;
  }

  setTasks(tasks) {
    this.currentTasks = tasks;
  }

  getTasksByID(taskIds) {
    var tasks = this.currentTasks;

    if (taskIds.length > 0) {
      tasks = tasks.filter((task) => (taskIds.indexOf(task.id) != -1));
    }

    return tasks.map((task) => task.id);
  }

  addTask(taskId, taskType) {
    var tasks = this.currentTasks;

    const otherTaskIdsOfSameType = tasks
      .filter((task) => ((task.id != taskId) && (task.type == taskType)))
      .map((task) => task.id);

    if (tasks.find((oldTask) => (oldTask.id == taskId)) == undefined) {
       tasks.push({ id: taskId, type: taskType });
    }

    this.setTasks(tasks);
    return otherTaskIdsOfSameType;
  }

  removeTask(taskId) {
    var remainingTasks = this.currentTasks.filter((task) => task.id != taskId);
    this.setTasks(remainingTasks);
  }

  removeTasks(taskIds) {
    var remainingTasks = this.currentTasks.filter((task) => taskIds.indexOf(task.id) == -1);
    this.setTasks(remainingTasks);
  }
}
