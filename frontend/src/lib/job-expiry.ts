import { mongoAPI as supabase } from "@/lib/mongodb-api";

export const checkAndExpireJobs = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('jobs')
      .update({ status: 'inactive' })
      .eq('status', 'active')
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) {
      console.error('Error expiring jobs:', error);
    }
  } catch (error) {
    console.error('Job expiry check failed:', error);
  }
};
