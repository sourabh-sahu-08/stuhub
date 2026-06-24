export type Role = "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  hint: string;
}
