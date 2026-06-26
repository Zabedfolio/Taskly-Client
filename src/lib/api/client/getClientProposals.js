const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Fetches all proposals submitted to the tasks posted by the logged-in client.
 * Authenticates with the session token.
 */
export const getClientProposals = async (clientId) => {
    if (!clientId) throw new Error('Client ID is required.');

    const [tasksRes, propsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/tasks`),
        fetch(`${BASE_URL}/api/proposals`)
    ]);

    if (!tasksRes.ok || !propsRes.ok) {
        throw new Error('Failed to retrieve tasks or proposals.');
    }

    const tasks = await tasksRes.json();
    const proposals = await propsRes.json();

    const clientTaskIds = new Set(
        tasks.filter(t => t.clientId === clientId).map(t => t._id)
    );

    const clientProposals = proposals.filter(p => clientTaskIds.has(p.taskId));
    clientProposals.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return clientProposals;
};
