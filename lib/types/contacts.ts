export interface Contact {
  id: string;
  displayName: string;
  email: string;
  jobTitle: string;
  company: string;
  phone: string;
  initials: string;
  isVIP: boolean;
  frequencyScore: number;
  /** True if this contact comes from the org directory (shared, read-only) */
  isOrgContact?: boolean;
}
