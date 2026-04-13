export interface Link {
  _id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LinkFormData {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  sortOrder?: number;
}

export interface AuthResponse {
  token: string;
  email: string;
}
