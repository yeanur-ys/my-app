export interface Profile {
  id: string;
  name: string;
  year: number;
  class_number: number;
  avatar_url?: string;
  full_name?: string;
}

export interface Community {
  id: string;
  name: string;
  color: string;
  icon?: string;
  class_number: number;
  graduation_year: number;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}
