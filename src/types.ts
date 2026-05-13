export interface PressCardData {
  id: string;
  name: string;
  nia: string;
  position: string;
  region: string;
  email: string;
  phone: string;
  photoUrl: string;
  status: string;
  description: string;
  expiryDate: string; // Internal use for backward compatibility, but won't be shown
  organization: string;
}

export type SortField = 'name' | 'nia' | 'expiryDate';
export type SortOrder = 'asc' | 'desc';
