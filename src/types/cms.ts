export interface SiteContentSection {
  sectionKey: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  announcement?: string;
  details?: string;
  description?: string;
  buttonText?: string;
  category?: 'home' | 'register' | 'shirt' | 'horror' | 'faq' | 'footer' | 'general';
  updatedAt: string;
  updatedBy?: string;
  [key: string]: any;
}

export interface AdminUser {
  username: string;
  displayName: string;
  role: 'SUPER_ADMIN';
  isLoggedIn: boolean;
  loginAt?: string;
}
