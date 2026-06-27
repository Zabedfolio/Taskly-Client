const  base_url = process.env.NEXT_PUBLIC_BASE_URL;

export const createTask = async (taskData) => {
  const res = await fetch(`${base_url}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
   });

  return res.json();
};