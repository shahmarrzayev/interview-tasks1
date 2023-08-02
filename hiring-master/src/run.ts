import { IExecutor } from "./Executor";
import ITask from "./Task";

export default async function run(
  executor: IExecutor,
  queue: AsyncIterable<ITask>,
  maxThreads = 0
) {
  maxThreads = Math.max(0, maxThreads);
  let tasks: ITask[] = [];
  let completedTasks: Promise<void>[] = [];
  for await (const q of queue) tasks.push(q);

  while (tasks.length >= 1) {
    let obj: any = {};
    for (const task of tasks) {
      if (!obj[task.targetId]) {
        obj[task.targetId] = true;
        completedTasks.push(executor.executeTask(task));
        tasks = tasks.filter((t) => t != task);
      }
      if (maxThreads != 0 && completedTasks.length == maxThreads) {
        await Promise.all(completedTasks);
        completedTasks = [];
      }
    }
    await Promise.all(completedTasks);
    for await (const q of queue) tasks.push(q);
  }
}
