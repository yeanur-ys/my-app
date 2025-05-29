export interface Profile {
  id: string;
  name: string;
  year: number;
  class: string;
}

export interface Community {
  id: string;
  name: string;
  color: string;
  owner_id: string;
}

export interface User {
  id: string;
  email: string;
  // Add other user fields as needed
}