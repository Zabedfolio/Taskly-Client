const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


export const submitProposal = async (formData, { userId, taskTitle } = {}) => {
    const payload = {

        taskId:          formData.get('taskId'),
        freelancerEmail: formData.get('freelancerEmail'),
        proposedBudget:  formData.get('proposedBudget'),
        estimatedDays:   formData.get('estimatedDays'),
        coverNote:       formData.get('coverNote'),
        userId:    userId    || null,
        taskTitle: taskTitle || null,
    };

     const res = await fetch(`${BASE_URL}/api/proposals`, {
        method:  'POST',

        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
    });

       if (!res.ok) {
        const  err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed with status ${res.status}`);
    }

    return res.json();
};
