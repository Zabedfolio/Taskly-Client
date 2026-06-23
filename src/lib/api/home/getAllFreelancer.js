const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/** Fetches ALL freelancers from the backend. Slice as needed per page. */
export const getAllFreelancers = async () => {
  const res = await fetch(`${BASE_URL}/api/freelancers`);
  if (!res.ok) throw new Error(`Failed to fetch freelancers: ${res.status}`);
  return res.json();
};
