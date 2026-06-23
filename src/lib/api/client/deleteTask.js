const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const deleteTask = async (id) => {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};