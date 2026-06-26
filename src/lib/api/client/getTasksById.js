const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getTasksById = async (clientId) => {
  const [tasksRes, proposalsRes, freelancersRes] = await Promise.all([
    fetch(`${BASE_URL}/api/tasks`),
    fetch(`${BASE_URL}/api/proposals`),
    fetch(`${BASE_URL}/api/freelancers`)
  ]);

  if (!tasksRes.ok) throw new Error('Failed to retrieve tasks.');

  const tasksList = await tasksRes.json();
  const proposalsList = proposalsRes.ok ? await proposalsRes.json() : [];
  const freelancersList = freelancersRes.ok ? await freelancersRes.json() : [];

  const clientTasks = tasksList.filter(t => t.clientId === clientId);

  return clientTasks.map(t => {
    const count = proposalsList.filter(p => p.taskId === t._id).length;
    const acceptedProp = proposalsList.find(p => p.taskId === t._id && p.status?.toLowerCase() === 'accepted');

    let freelancerEmail = null;
    let freelancerName = null;
    let freelancerImage = null;

    if (acceptedProp) {
      freelancerEmail = acceptedProp.freelancerEmail;
      const fUser = freelancersList.find(u => u.email?.toLowerCase() === acceptedProp.freelancerEmail?.toLowerCase());
      if (fUser) {
        freelancerName = fUser.name || 'Freelancer';
        freelancerImage = fUser.image || null;
      }
    }

    return {
      ...t,
      proposals: count,
      freelancerEmail,
      freelancerName,
      freelancerImage
    };
  });
};