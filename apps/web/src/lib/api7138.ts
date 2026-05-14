// ======================================================
// 📦 TYPES
// ======================================================

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
};
export type DoctorDashboard = {
  pending: number;
  reviewed: number;
  total: number;

  totalScans: number; // 🔥 ضيف دي

  todayReviewed: number;
  avgConfidence: number;

  highRisk: number;
  mediumRisk: number;
  lowRisk: number;

  tumorDistribution: Record<string, number>;

  weeklyActivity: { label: string; value: number }[];
  riskChart: { label: string; value: number }[];

  recentCases: any[];
  highRiskCases?: any[];

  suggestion: string;
};


export type DashboardStats = {
  totalUsers: number;
  totalScans: number;
  totalAnalysis: number;
  pending: number;
  completed: number;
  tumorStatistics: Record<string, number>;
  outcomes: {
    malignant: number;
    benign: number;
  };
  usersByRole: {
    admins: number;
    doctors: number;
    students: number;
  };
};

export type UserDto = {
  id: string;
  numericId: number;
  displayName: string;
  email: string;
  phoneNumber?: string;
  userName?: string;
  roleName?: string;
  role?: string[];
  isActive?: boolean;
  isOnline?: boolean;
  presence?: string;
};
export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
export type Scan7138 = {
  id: number;
  imagePath: string; // ✅ صح
  status: string;
  uploadDate: string; // ✅ صح
};
export interface ScanStats {
  total: number;
  pending: number;
  completed: number;
}
export type TumorTypeDto = {
  id: number;
  name: string;
  description?: string;
};
export interface ScansResponse {
  scans: Scan7138[];
  stats: {
    total: number;
    pending: number;
    completed: number;
  };
}
export interface Analysis {
  id: number;
  scanId: number;
  imageUrl: string;
  prediction: string;
  confidence: number;
  summary: string;
}
// ======================================================
// 🔐 TOKEN
// ======================================================

function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}


// ======================================================
// 🔁 BASE FETCH
// ======================================================

async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getToken();

  if (token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}

// ======================================================
// 📦 JSON FETCH
// ======================================================
type UploadResponse = {
  scanId: number;
};
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetchJson<T>(
  url: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${url}`, {  // ✅ أهم سطر
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  let data: any;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(
      data?.message ||
      JSON.stringify(data) ||
      "Request failed"
    );
  }

  return data;
}

type NotificationsResponse = {
  totalCount: number;
  page: number;
  pageSize: number;
  data: NotificationDto[];
};

export async function getNotifications(page = 1): Promise<NotificationsResponse> {
  const res = await apiFetchJson<ApiResponse<NotificationsResponse>>(
    `/api/notifications?page=${page}&pageSize=10`
  );

  return res.data.data;
}

// ✅ GET UNREAD COUNT
export async function getUnreadCount(): Promise<number> {
  const res = await apiFetchJson<number>(
    "/api/notifications/unread-count"
  );
  return res.data;
}

// ✅ MARK AS READ
export async function markNotificationAsRead(id: number): Promise<boolean> {
  const res = await apiFetchJson<any>(
    `/api/notifications/${id}/read`,
    { method: "PUT" }
  );
  return res.success;
}

// ✅ MARK ALL AS READ
export async function markAllNotificationsAsRead(): Promise<boolean> {
  const res = await apiFetchJson<any>(
    "/api/notifications/read-all",
    { method: "PUT" }
  );

  return res.success;
}

// ✅ DELETE
export async function deleteNotification(id: number): Promise<boolean> {
  const res = await apiFetchJson<any>(
    `/api/notifications/${id}`,
    { method: "DELETE" }
  );
  return res.success;
}

//////////////////////////////////////////////////////////
// ⚙️ NOTIFICATION SETTINGS
//////////////////////////////////////////////////////////

export interface NotificationSettings {
  scanResultNotifications: boolean;
  chatNotifications: boolean;
  systemNotifications: boolean;
}

// ✅ GET SETTINGS
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const res = await apiFetchJson<NotificationSettings>(
    "/api/notification-settings"
  );
  return res.data;
}

// ✅ UPDATE SETTINGS
export async function updateNotificationSettings(
  payload: NotificationSettings
): Promise<boolean> {
  const res = await apiFetchJson<any>(
    "/api/notification-settings",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
  return res.success;
}

//////////////////////////////////////////////////////////
// 🚪 LOGOUT NOTIFICATIONS
//////////////////////////////////////////////////////////

export async function logout(): Promise<boolean> {
  const res = await apiFetchJson<any>(
    "/api/Auth/logout",
    {
      method: "POST",
    }
  );
  return res.success;
}

//////////////////////////////////////////////////////////
// 👤 UPDATE PROFILE
//////////////////////////////////////////////////////////

export async function updateProfile(payload: {
  displayName: string;
  email: string;
  phoneNumber: string;
}) {
  const res = await apiFetchJson<UserDto>(
    "/api/Users/profile",
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return res.data; // ✅ زي باقي السيستم
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const res = await fetch("/api/Auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) throw json;

  return json;
}
//////////////////////////////////////////////////////////
// 👥 USERS API (FULL CRUD)
//////////////////////////////////////////////////////////

export async function getAllUsers(): Promise<UserDto[]> {
  const res = await apiFetchJson<UserDto[]>("/api/Users");
  return res.data;
}

export async function getUserById(numericId: number): Promise<UserDto> {
  const res = await apiFetchJson<UserDto>(`/api/Users/${numericId}`);
  return res.data;
}

export async function createUser(payload: {
  displayName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: string;
  isActive: boolean;
}): Promise<UserDto> {
  const res = await apiFetchJson<UserDto>("/api/Users/create", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateUser(
  numericId: number,
  payload: any
): Promise<UserDto> {
  const res = await apiFetchJson<UserDto>(
    `/api/Users/Update/${numericId}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return res.data;
}

export async function deleteUser(numericId: number): Promise<boolean> {
  const res = await apiFetchJson<any>(
    `/api/Users/Delete/${numericId}`,
    { method: "DELETE" }
  );
  return res.success;
}
//////////////////////////////////////////////////////////
// 🔐 AUTH
//////////////////////////////////////////////////////////

export async function loginApi(email: string, password: string) {
  const res = await apiFetchJson<any>("/api/Auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

export async function registerApi(payload: any) {
  const res = await apiFetchJson<any>("/api/Auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

//////////////////////////////////////////////////////////
// 📊 DASHBOARD
//////////////////////////////////////////////////////////

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await apiFetchJson<DashboardStats>("/api/dashboard");
  return res.data;
}
export async function getDoctorDashboard(): Promise<DoctorDashboard> {
  const res = await apiFetchJson<any>(
    "/api/dashboard/doctor-dashboard"
  );

  return res.data ?? res; // 🔥 الحل هنا
}

export async function getStudentDashboard(): Promise<any> {
  const res = await apiFetchJson<any>("/api/dashboard/student");
  return res.data;
}

//////////////////////////////////////////////////////////
// 📤 SCANS
//////////////////////////////////////////////////////////

export async function uploadScan7138(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("Image", file);

  const res = await apiFetchJson<ApiResponse<UploadResponse>>("/api/scans", {
    method: "POST",
    body: form,
  });

  return res.data; // 🔥 { scanId }
}
export async function getMyScans7138(): Promise<ScansResponse> {
  const res = await apiFetchJson<ApiResponse<ScansResponse>>(
    "/api/scans/My_Scans"
  );

  return res.data; // 🔥 typed 100%
}

export async function getScanById7138(id: number): Promise<Scan7138> {
  const res = await apiFetchJson<any>(`/api/scans/${id}`);

  return res.data; // 🔥 أهم سطر
}
export async function deleteScan7138(id: number): Promise<boolean> {
  const res = await apiFetchJson<any>(`/api/scans/${id}`, {
    method: "DELETE",
  });
  return res.success;
}


export interface AdminScansResponse {
  scans: Scan7138[];
  stats: ScanStats;
}

// ✅ Admin - Get All Scans + Stats
export async function getAllScansAdmin7138(): Promise<AdminScansResponse> {
  const res = await apiFetchJson<AdminScansResponse>(
    "/api/scans/admin/all"
  );

  return res.data;
}
//////////////////////////////////////////////////////////
// 🧠 ANALYSIS
//////////////////////////////////////////////////////////

// 🔥 Run Analysis
export async function runAnalysis7138(scanId: number): Promise<any> {
  const res = await apiFetchJson<any>(`/api/analysis/run/${scanId}`, {
    method: "POST",
  });
  return res.data;
}

// 🔥 Get single analysis
export async function getAnalysis7138(scanId: number): Promise<any> {
  const res = await apiFetchJson<any>(`/api/analysis/${scanId}`);
  return res.data;
}

// 🔥 Get ALL (لو محتاجه)
export async function getAllAnalysis7138(): Promise<any> {
  const res = await apiFetchJson<any>(`/api/analysis`);
  return res.data;
}

// 🔥 Details
export async function getAnalysisDetails7138(analysisId: number): Promise<any> {
  const res = await apiFetchJson<any>(
    `/api/analysis/analysis/${analysisId}/details`
  );
  return res.data;
}

// ✅ My Analysis
export async function getMyAnalysis7138(): Promise<Analysis[]> {
  const res = await apiFetchJson<{ data: Analysis[] }>(
    `/api/analysis/my-analysis`
  );

  return res.data;
}

// ✅ Other Analysis (NEW)
export async function getOtherAnalysis7138(): Promise<Analysis[]> {
  const res = await apiFetchJson<{ data: Analysis[] }>(
    `/api/analysis/analysis/others`
  );

  return res.data;
}
//////////////////////////////////////////////////////////
// 🧬 TUMOR TYPE API (FULL CRUD)
//////////////////////////////////////////////////////////

// ✅ GET ALL
export async function getAllTumorTypes(): Promise<TumorTypeDto[]> {
  const res = await apiFetchJson<TumorTypeDto[]>("/api/TumorType");
    return res; // ✅ مهم جدًا
}

// ✅ GET BY ID
export async function getTumorTypeById(id: number): Promise<TumorTypeDto> {
  const res = await apiFetchJson<TumorTypeDto>(`/api/TumorType/${id}`);
    return res; // ✅ مهم جدًا

}

// ✅ CREATE
export async function createTumorType(payload: {
  name: string;
  description?: string;
}): Promise<TumorTypeDto> {
  const res = await apiFetchJson<TumorTypeDto>("/api/TumorType", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res;
}

// ✅ UPDATE
export async function updateTumorType(
  id: number,
  payload: {
    name: string;
    description?: string;
  }
): Promise<TumorTypeDto> {
  const res = await apiFetchJson<TumorTypeDto>(
    `/api/TumorType/${id}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
    return res; // ✅ مهم جدًا

}

// ✅ DELETE
export async function deleteTumorType(id: number): Promise<boolean> {
  const res = await apiFetchJson<any>(`/api/TumorType/${id}`, {
    method: "DELETE",
  });
  return res.success;
}
//////////////////////////////////////////////////////////
// 📝 DOCTOR NOTES
//////////////////////////////////////////////////////////

export async function createDoctorNote7138(
  analysisResultId: number,
  note: string
): Promise<any> {
  const res = await apiFetchJson<any>(`/api/doctor-notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ analysisResultId, note }),
  });
  return res.data;
}

export async function getDoctorNotes7138(
  analysisId: number
): Promise<any> {
  const res = await apiFetchJson<any>(`/api/doctor-notes/${analysisId}`);
  return res.data;
}

export async function deleteDoctorNote7138(
  id: number
): Promise<boolean> {
  const res = await apiFetchJson<any>(`/api/doctor-notes/${id}`, {
    method: "DELETE",
  });
  return res.success;
}