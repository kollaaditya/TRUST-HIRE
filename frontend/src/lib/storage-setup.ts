import { mongoAPI as supabase } from "@/lib/mongodb-api";

export const createStorageBuckets = async () => {
  try {
    // Create resumes bucket
    const { error: resumesBucketError } = await supabase.storage.createBucket('resumes', {
      public: false,
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (resumesBucketError && !resumesBucketError.message.includes('already exists')) {
      console.error('Error creating resumes bucket:', resumesBucketError);
    }

    console.log('Storage buckets setup completed');
  } catch (error) {
    console.error('Storage setup error:', error);
  }
};
