export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  mobilecode: string;
  password: string;
  language: string;
  country: string;
  memtype: "Free" |
  "basic_chat_pack" |
  "standard_pack" |
  "weekly_pack" |
  "12-day_pack" |
  "monthly_pack" |
  "exclusive_member";
  verify_email: boolean;
  photohide: boolean;
  height: number | null;
  membershipExpiryDate: string;
  video_min: number;
  lastSeen: string;
  gender: string;
  diet: string;
  phonehide: boolean;
  photoProtect: boolean;
  voice_min: number;
  dob: string;
  smoke: string;
  chatcontact: boolean;
  photo1: string;
  photo2: string;
  age: number;
  drink: string;
  partnerExpectations: string;
  devicetoken: string;
  photo1Approve: boolean;
  photo2Approve: boolean;
  maritalStatus: string | null;
  city_name: string;
  bio: string;
  pagecount: number;
  education: string | null;
  postal: string;
  status: 'Paid' | 'Active' | 'Banned' | 'Deleted' | 'Pending'| "Exclusive" ;
  onlineUsers: boolean;
  occupation: string;
  state: string | null;
  mobileverify: boolean;
  verify_status: boolean;
  chat_msg: number;
  // Admin specific fields
  bio_approval?: boolean;
  partnerExpectations_approval?: boolean;
  chatAllowed?: boolean;
  videoCallAllowed?: boolean;
  audioCallAllowed?: boolean;
  //partnerExpectations_approval?: boolean;
  //bio_approval?: boolean;
}

export interface Payment {
  date(date: any): import("react").ReactNode;
  payment_id: any;
  order_id: any;
  mobile_no: any;
  email_id: any;
  id: string;
  user_id: string;
  userName: string;
  userEmail: string;
  planName: string;
  planType: 'Free' | 'Paid' | 'Exclusive';
  amount: number;
  currency: string;
  status: 'Success' | 'Failed' | 'Pending' | 'Cancelled';
  paymentMethod: string;
  transactionId: string;
  purchaseDate: string;
  expiryDate: string;
}

export interface UserFilters {
  search?: string;        // Search by name, email, mobile, or user ID
  status?: string;        // Filter by user status
  gender?: string;        // Filter by gender
  plans?: string;         // Filter by plans (free, paid, etc.)
  online?: boolean;       // Filter by online status
  photo1?: boolean;       // Filter by Photo1 approval status
  photo2?: boolean;       // Filter by Photo2 approval status
  page?: number;          // Page number
  limit?: number;         // Number of users per page
  country?: string;       // Filter by country

  // Legacy fields for backward compatibility (will be mapped to new fields)
  searchQuery?: string;   // Will be mapped to 'search'
  memtype?: string;       // Will be mapped to 'plans'
  photo1Approve?: boolean; // Will be mapped to 'photo1'
  photo2Approve?: boolean; // Will be mapped to 'photo2'
  bioApproved?: boolean;   // Filter by bio approval status
  expectationsApproved?: boolean; // Filter by expectations approval status
}

export interface PaymentFilters {
  currency: any;
  status?: string;
  planType?: string;
  paymentMethod?: string;
  searchQuery?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}


export const genderOptions = [
  // "Bisexual (Man)",
  "Gay", 
  "Lesbian",
  "Bisexual Man",
  "Transgender Woman",
  "Transgender Man",
  "Bisexual (Woman)",
  "male",
  "female",
  "Bisexual | Man",
  "Transgender | Women",
  "+ PLUS",
  "Nonbinary",
  "Intersex", 
  "Transgender | Man",
  "Asexual",
  "Queer",
  "Bisexual | Woman",
  "other"
] as const;

export const membershipOptions = [

 
  "Free",
  "basic_chat_pack",
  "standard_pack",
  "weekly_pack",
  "12-day_pack",
  "monthly_pack",
  "exclusive_member"

] as const;

// 🔹 Derive types from arrays
export type GenderOption = typeof genderOptions[number];
export type MembershipOption = typeof membershipOptions[number];

// 🔹 Example interface
export interface UserProfile {
  gender: GenderOption;
  membership: MembershipOption;
}


