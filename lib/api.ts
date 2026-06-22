import { mockAccount, mockDashboard, mockCalls, mockFeatureSettings, mockBillingSummary, mockPlans } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let refreshPromise: Promise<string> | null = null;

function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("gigahoo_preview") === "true";
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("gigahoo_auth");
    if (!raw) return null;
    return JSON.parse(raw).accessToken ?? null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("gigahoo_auth");
    if (!raw) return null;
    return JSON.parse(raw).refreshToken ?? null;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.removeItem("gigahoo_auth");
    document.cookie = "gigahoo_auth=; path=/; max-age=0";
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  const existing = JSON.parse(localStorage.getItem("gigahoo_auth") || "{}");
  const updated = {
    ...existing,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
  };
  localStorage.setItem("gigahoo_auth", JSON.stringify(updated));
  document.cookie = `gigahoo_auth=1; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  return data.accessToken as string;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !isRetry && !path.startsWith("/api/auth/")) {
    if (!refreshPromise) refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
    try {
      await refreshPromise;
      return apiRequest<T>(path, options, true);
    } catch {
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.title || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),

  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body: body != null ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PUT", body: body != null ? JSON.stringify(body) : undefined }),
};

// ── Auth ──

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  isNewUser: boolean;
}

export function googleLogin(idToken: string) {
  return api.post<AuthResponse>("/api/auth/google", { idToken });
}

export function sendMagicLink(email: string) {
  return api.post<{ message: string }>("/api/auth/magic-link", { email });
}

export function verifyMagicLink(email: string, code: string) {
  return api.post<AuthResponse>("/api/auth/verify-magic-link", { email, code });
}

export function sendSmsCode(phoneNumber: string) {
  return api.post<{ message: string }>("/api/auth/sms/send", { phoneNumber });
}

export function verifySmsCode(phoneNumber: string, code: string) {
  return api.post<AuthResponse>("/api/auth/sms/verify", { phoneNumber, code });
}

export function refreshTokenApi(refreshToken: string) {
  return api.post<{ accessToken: string; refreshToken: string; expiresAt: string }>(
    "/api/auth/refresh",
    { refreshToken },
  );
}

export function revokeToken(refreshToken: string) {
  return api.post("/api/auth/revoke", { refreshToken });
}

// ── Account ──

export interface AccountData {
  id: string;
  businessName: string;
  category: string;
  categoryId: number;
  businessPhone: string;
  phoneCountryCode: string;
  email: string;
  serviceArea: string | null;
  websiteUrl: string | null;
  businessHours: string | null;
  forwardingPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string;
  countryId: number;
  plan: string;
  planId: number;
  includedMinutes: number;
  billingPeriod: string;
  minutesUsed: number;
  createdAt: string;
}

export function createAccount(data: {
  businessName: string;
  categoryId: number;
  businessPhone: string;
  phoneCountryCode: string;
  email: string;
  planId: number;
}) {
  return api.post<AccountData>("/api/account", data);
}

export function getAccount() {
  if (isPreviewMode()) {
    return Promise.resolve(mockAccount);
  }
  return api.get<AccountData>("/api/account");
}

export function updateAccount(data: {
  businessName: string;
  categoryId: number;
  businessPhone: string;
  phoneCountryCode: string;
  email: string;
  websiteUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  regionId: number | null;
  regionCustom: string | null;
  postalCode: string | null;
  countryId: number;
}) {
  return api.put<AccountData>("/api/account", data);
}

// ── Dashboard ──

export interface DashboardOverview {
  plan: string;
  includedMinutes: number;
  minutesUsed: number;
  remainingMinutes: number;
  billingPeriod: string;
  callsAnswered: number;
  avgCallDurationSeconds: number;
  recentCalls: CallData[];
}

export function getDashboardOverview() {
  if (isPreviewMode()) {
    return Promise.resolve(mockDashboard);
  }
  return api.get<DashboardOverview>("/api/dashboard/overview");
}

// ── Calls ──

export interface CallData {
  id: string;
  callerName: string | null;
  callerPhone: string;
  dateTimeUtc: string;
  durationSeconds: number;
  language: string;
  summary: string | null;
  status: string;
  collectedInfo: { label: string; value: string }[];
}

export interface CallsPage {
  items: CallData[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export function getCalls(page = 1, pageSize = 20, status?: string) {
  if (isPreviewMode()) {
    const filtered = status ? mockCalls.filter(c => c.status === status) : mockCalls;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return Promise.resolve({
      items,
      totalCount: filtered.length,
      page,
      pageSize,
    });
  }
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.set("status", status);
  return api.get<CallsPage>(`/api/calls?${params}`);
}

export function getCall(id: string) {
  if (isPreviewMode()) {
    const call = mockCalls.find(c => c.id === id);
    if (!call) return Promise.reject(new Error("Call not found"));
    return Promise.resolve(call);
  }
  return api.get<CallData>(`/api/calls/${id}`);
}

// ── Billing ──

export interface BillingSummary {
  plan: string;
  includedMinutes: number;
  minutesUsed: number;
  remainingMinutes: number;
  billingPeriod: string;
  usagePercent: number;
}

export interface PlanData {
  id: number;
  name: string;
  priceMonthly: number;
  includedMinutes: number;
  hasOptionalFeatures: boolean;
  features: string[];
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  dateUtc: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
}

export interface PaymentMethodData {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export function getBillingSummary() {
  if (isPreviewMode()) {
    return Promise.resolve(mockBillingSummary);
  }
  return api.get<BillingSummary>("/api/billing/summary");
}

export function getPlans() {
  if (isPreviewMode()) {
    return Promise.resolve(mockPlans);
  }
  return api.get<PlanData[]>("/api/billing/plans");
}

export function changePlan(planId: number) {
  return api.post<{ message: string; plan: string }>("/api/billing/change-plan", { planId });
}

export function getInvoices() {
  return api.get<InvoiceData[]>("/api/billing/invoices");
}

export function getPaymentMethod() {
  return api.get<PaymentMethodData>("/api/billing/payment-method");
}

export function createBillingPortal() {
  return api.post<{ url: string }>("/api/billing/portal");
}

// ── Feature Settings ──

export interface FeatureSettings {
  answerQuestions: boolean;
  servicesInfo: string | null;
  serviceAreas: string | null;
  businessHours: string | null;
  emergencyAvailability: string | null;
  pricingPolicy: string | null;
  warrantyPolicy: string | null;
  frequentlyAskedQuestions: string | null;
  additionalBusinessInfo: string | null;
  serveArea: boolean;
  distanceKm: number;
  quoteInspection: boolean;
  pricePerKm: number;
}

export function getFeatureSettings() {
  if (isPreviewMode()) {
    return Promise.resolve(mockFeatureSettings);
  }
  return api.get<FeatureSettings>("/api/features");
}

export function updateFeatureSettings(data: FeatureSettings) {
  if (isPreviewMode()) {
    return Promise.resolve(data);
  }
  return api.put<FeatureSettings>("/api/features", data);
}

// ── Contact ──

export function submitContact(data: { name: string; email: string; subject: string; message: string }) {
  return api.post<{ message: string }>("/api/contact", data);
}

// ── Lookup ──

export interface CountryData {
  id: number;
  name: string;
  code: string;
  dialCode: string;
  flag: string | null;
}

export interface RegionData {
  id: number;
  name: string;
  code: string;
}

export interface CategoryData {
  id: number;
  name: string;
}

export interface LanguageData {
  id: number;
  name: string;
}

export function getCountries() {
  return api.get<CountryData[]>("/api/lookup/countries");
}

export function getRegions(countryId: number) {
  return api.get<RegionData[]>(`/api/lookup/countries/${countryId}/regions`);
}

export function getCategories() {
  return api.get<CategoryData[]>("/api/lookup/categories");
}

export function getLanguages() {
  return api.get<LanguageData[]>("/api/lookup/languages");
}
