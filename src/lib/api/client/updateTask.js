const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const updateTask = async (id, data) => {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return res.json();
};