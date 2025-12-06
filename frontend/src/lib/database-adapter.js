// Simple mock data for now
export class DatabaseAdapter {
  static async getJobs() {
    return [];
  }

  static async createJob(jobData) {
    return jobData;
  }

  static async getApplications() {
    return [];
  }
}
