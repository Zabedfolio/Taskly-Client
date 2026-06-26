const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getAllTasks = async () => {
  const res = await fetch(`${BASE_URL}/api/tasks`);
  return res.json()
};