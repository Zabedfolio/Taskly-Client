const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getTasksById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`);
  return res.json();
};