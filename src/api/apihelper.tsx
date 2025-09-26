import axios from "axios";
import { getAuthToken } from "@/api/auth";
import { User, UserFilters } from "@/types/user";

// Base URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fastapi.umeed.app/api/v1";
const ADMIN_BASE_URL = `${API_BASE_URL}/admin/admin`;
export const AvatarImageUser = `https://fastapi.umeed.app/static/uploads/`;
const BASE_URL = "https://fastapi.umeed.app/api/v1/admin/admin/users_key";

const BASE_URL_user = "https://fastapi.umeed.app/api/v1/admin/admin/change-password";

// ✅ Common API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, number>;
  
}



// ✅ Error Handler
const handleApiError = (error: any): ApiResponse => ({
  success: false,
  message: error.response?.data?.message || "An unexpected error occurred",
});

// ✅ Core Request Function
const token = getAuthToken();
const apiRequest = async (
  method: "get" | "put" | "post" | "delete",
  endpoint: string,
  data?: any,
  params?: Record<string, any>
): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await axios({
      method,
      url: `${ADMIN_BASE_URL}${endpoint}`,
      data,
      params,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

// ✅ Generic Helpers
export const apiGet = (endpoint: string, params?: Record<string, any>) =>
  apiRequest("get", endpoint, undefined, params);
export const apiPost = (endpoint: string, data?: any) =>
  apiRequest("post", endpoint, data);
export const apiPut = (endpoint: string, data?: any) =>
  apiRequest("put", endpoint, data);
export const apiDelete = (endpoint: string) =>
  apiRequest("delete", endpoint);

// ✅ User Management APIs
export const updateUserStatus = async (
  userId: string,
  status: string
): Promise<ApiResponse> => {
  const response = await apiPut(`/users/${userId}/status`, { status });
  if (response.success) response.message = `User status updated to ${status}`;
  return response;
};

export const updatePhotoApproval = async (
  userId: string,

  photoType: "photo1" | "photo2",
  approved: boolean
) => {
  try {
    const params = new URLSearchParams();
    if (photoType === "photo1") {
      params.append("photo1Approve", String(approved));
    } else {
      params.append("photo2Approve", String(approved));
    }

    const url = `${API_BASE_URL}/users/${userId}?${params.toString()}`;

    const response = await axios.put(url, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating photo approval:", error.response || error);
    throw error.response?.data || { message: "Failed to update photo approval" };
  }
};


export const updateContentApproval = async (
  userId: string,
  contentType: "bio" | "expectations",
  approved: boolean
): Promise<ApiResponse> => {
  const response = await apiPut(`/users/${userId}/content/${contentType}`, { approved });
  if (response.success) response.message = `${contentType} ${approved ? "approved" : "rejected"}`;
  return response;
};

export const updateUserPermission = async (
  userId: string,
  permission: "chat" | "video" | "audio",
  allowed: boolean
): Promise<ApiResponse> => {
  const response = await apiPut(`/users/${userId}/permissions/${permission}`, { allowed });
  if (response.success) response.message = `${permission} ${allowed ? "enabled" : "disabled"}`;
  return response;
};

// ✅ Bulk Update (ALL USERS)
export const updateAllUsers = async (
  updateData: Record<string, any>
): Promise<ApiResponse> => {
  const response = await apiPut(`/users`, updateData);
  if (response.success) response.message = `All users updated successfully`;
  return response;
};

// ✅ Fetch Single User
export const getUserById = async (userId: string): Promise<ApiResponse<User>> => {
  return await apiGet(`/users/${userId}`);
};

// ✅ Fetch All Users with Filters (matching API specification)
export const getAllUser = async (
  page: number = 1,
  limit: number = 10,
  filters?: UserFilters
): Promise<ApiResponse<{ users: User[]; total: number; totalPages: number;ActiveUsers:number; 
  PendingUsers:number; BannedUsers:number; PaidUsers:number; ExclusiveUsers:number; Photo1Pending:number; Photo2Pending:number; BioPending:number; ExpectationsPending:number;  
}>> => {
  // Build parameters according to API specification
  const params: Record<string, any> = {
    page,
    limit,
  };

  // Add filters if they exist and are not empty
  if (filters) {
    // Handle search (support both new 'search' and legacy 'searchQuery')
    const searchValue = filters.search || filters.searchQuery;
    if (searchValue && searchValue.trim() !== "") {
      params.search = searchValue.trim();
    }

    if (filters.status && filters.status !== "") {
      params.status = filters.status;
    }
    if (filters.gender && filters.gender !== "") {
      params.gender = filters.gender;
    }

    // Handle plans (support both new 'plans' and legacy 'memtype')
    const plansValue = filters.plans || filters.memtype;
    if (plansValue && plansValue !== "") {
      params.plans = plansValue;
    }

    if (filters.online !== undefined) {
      params.online = filters.online;
    }

    // Handle photo1 (support both new 'photo1' and legacy 'photo1Approve')
    const photo1Value = filters.photo1 !== undefined ? filters.photo1 : filters.photo1Approve;
    if (photo1Value !== undefined) {
      params.photo1 = photo1Value;
    }

    // Handle photo2 (support both new 'photo2' and legacy 'photo2Approve')
    const photo2Value = filters.photo2 !== undefined ? filters.photo2 : filters.photo2Approve;
    if (photo2Value !== undefined) {
      params.photo2 = photo2Value;
    }
  }
    const bioApprovedValue = filters.bioApproved !== undefined ? filters.bioApproved : filters.bioApproved;
    if (bioApprovedValue  !== undefined) {
      params.bioApproved =bioApprovedValue ;
    }

    // Handle photo2 (support both new 'photo2' and legacy 'photo2Approve')
    const expectationsApprovedValue  = filters.expectationsApproved !== undefined ? filters.expectationsApproved : filters.expectationsApproved;
    if (expectationsApprovedValue  !== undefined) {
      params.expectationsApproved = expectationsApprovedValue ;
    }
  //console.log('API Request params:', params); // Debug log

  const response = await apiGet("/users", params);
  //console.log('API Response:', response.data.meta); // Debug log
  if (response.success) {
    const userData = response.data?.data || response.data || {};
    const userList = Array.isArray(userData) ? userData : userData.users || [];
    const userMeta = response.data.meta || {};
    response.data = {
      users: userList,
      total: userMeta.total || userList.length,
      totalPages: userMeta.pages || Math.ceil((userData.total || userList.length) / limit),
     
      ActiveUsers: userMeta.active_users || 0,
      PendingUsers: userMeta.pending_users || 0,
      BannedUsers: userMeta.banned_users || 0,
      ExclusiveUsers: userMeta.exclusive_users || 0,
      PaidUsers: userMeta.paid_users || 0,
      Photo1Pending: userMeta.photo1_pending_users || 0,
      Photo2Pending: userMeta.photo2_pending_users || 0,
      BioPending: userMeta.bio_approval_pending_users || 0,
      ExpectationsPending: userMeta.partnerExpectations_approval_pending_users || 0,
      //FreeUsers: userMeta.free_users || 0,
    };
  }
  return response;
};

// ✅ Payments API
export const getAllPayments = async (): Promise<ApiResponse> => apiGet("/payments");



export const updateUserMembership = async (
  userId: string,
  token: string,
   membershipData: {
    memtype?: string | null;
    expiry?: string | null;
    photo1Approve?: boolean | null;
    photo2Approve?: boolean | null;
    status?: string | null;
    expectationsApproved?: boolean | null;
    bioApproved?: boolean | null;
    
  }
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/users/${userId}`,
      new URLSearchParams(
        Object.entries(membershipData).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      ),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
    console.log('API Update Responsed:', response.data); // Debug log
  } catch (error: any) {
    console.error("Error updating membership:", error);
    throw error.response?.data || error.message;
  }
};







export const updateUserById = async (
  userId: string,
  token: string,
  formData: Record<string, string | null>
) => {
  try {
    const response = await axios.put(
      `https://fastapi.umeed.app/api/v1/admin/admin/users_key/${userId}`,
      new URLSearchParams(formData), // ✅ Convert to x-www-form-urlencoded
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw error.response?.data || error.message;
  }
};





export const changeUserPassword = async (userId, password) => {
  try {
    const response = await axios.post(
      "https://fastapi.umeed.app/api/v1/admin/admin/change-password",
      null, // No request body since params are in query
      {
         headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          userId: userId,
          password: password,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error.response?.data || error.message;
  }
};


// export const updateUserKey = async (userId, data) => {
//   try {
//     const response = await axios.put(
//       `${API_BASE_URL}/users_key/${userId}`,
//       new URLSearchParams(data), // convert to x-www-form-urlencoded
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error updating user key:", error.response || error);
//     throw error;
//   }
// };


export type BulkUpdatePayload = {
  user_ids: string[]; // required
  // optional update fields (match server names)
  photo1Approve?: boolean | null;
  photo2Approve?: boolean | null;
  bioApproved?: boolean | null;
  expectationsApproved?: boolean | null;
  status?: string | null;
};

export const updateUsersBulk = async (payload: BulkUpdatePayload) => {
  const token = getAuthToken();
  if (!token) {
    throw { message: "No auth token available. Please login." };
  }

  // Use first id as the path param — server ignores it if payload.user_ids present.
  const firstId = payload.user_ids && payload.user_ids.length > 0 ? payload.user_ids[0] : "bulk";
  const url = `https://fastapi.umeed.app/api/v1/admin/admin/users/${firstId}`;

  try {
    const res = await axios.put(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });
    return res.data; // expected { success, message, meta, ... }
  } catch (err: any) {
    const payloadErr = err?.response?.data ?? { message: err?.message ?? "Unknown error" };
    console.error("[updateUsersBulk] error:", payloadErr);
    throw payloadErr;
  }
};

export const deleteUserById = async (userId: string): Promise<ApiResponse> => {
  return await apiDelete(`/deleteUser?userId=${userId}`);
}