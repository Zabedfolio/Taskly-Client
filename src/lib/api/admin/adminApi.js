const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getAdminStats = async (token) => {
    if (!token) throw new Error('Auth token required.');
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
};

export const getAllUsers = async (token) => {
    if (!token) throw new Error('Auth token required.');
    const res = await fetch(`${BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
};

export const blockUser = async (userId, isBlocked, token) => {
    if (!token) throw new Error('Auth token required.');
    const res = await fetch(`${BASE_URL}/api/users/${userId}/block`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked })
    });
    if (!res.ok) throw new Error('Failed to update user block status');
    return res.json();
};

export const getAllTasks = async () => {
    // get tasks is public for browsing, but we call it from admin console
    const res = await fetch(`${BASE_URL}/api/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
};

export const deleteTask = async (taskId, token) => {
    if (!token) throw new Error('Auth token required.');
    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
};

export const getAdminTransactions = async (token) => {
    if (!token) throw new Error('Auth token required.');
    const res = await fetch(`${BASE_URL}/api/admin/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transaction history');
    return res.json();
};
