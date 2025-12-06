import { mongoAPI as supabase } from "@/lib/mongodb-api";

export const setupDatabase = async () => {
  try {
    // Add resume_url column if it doesn't exist
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='resume_url') THEN
            ALTER TABLE public.profiles ADD COLUMN resume_url TEXT;
          END IF;
        END $$;
      `
    });

    if (columnError) {
      console.log('Column may already exist or RPC not available:', columnError.message);
    }

    // Add new job fields if they don't exist
    const { error: jobFieldsError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='salary_min') THEN
            ALTER TABLE public.jobs ADD COLUMN salary_min INTEGER;
            ALTER TABLE public.jobs ADD COLUMN salary_max INTEGER;
            ALTER TABLE public.jobs ADD COLUMN experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive'));
            ALTER TABLE public.jobs ADD COLUMN job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship'));
          END IF;
        END $$;
      `
    });

    if (jobFieldsError) {
      console.log('Job fields may already exist or RPC not available:', jobFieldsError.message);
    }

    console.log('Database setup completed');
  } catch (error) {
    console.error('Database setup error:', error);
  }
};
