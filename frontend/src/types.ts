export type Role = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  isProfileComplete: boolean;
  department?: {
    _id: string;
    name: string;
    code: string;
  };
  rollNumber?: string;
  semester?: number;
  cgpa?: number;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  hint: string;
}
