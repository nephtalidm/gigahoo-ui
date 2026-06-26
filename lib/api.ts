import { mockAccount, mockDashboard, mockConversations, mockFeatureSettings, mockBillingSummary, mockPlans } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = typeof window !== "undefined" ? localStorage.getItem("gigahoo_token") : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && !isRetry && !path.startsWith("/api/auth/")) {
      localStorage.removeItem("gigahoo_token");
      localStorage.removeItem("gigahoo_expires_at");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
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
  regionId: number | null;
  postalCode: string | null;
  country: string;
  countryId: number;
  plan: string;
  planId: number;
  includedMinutes: number;
  billingPeriod: string;
  minutesUsed: number;
  createdAt: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  requiresCurrentPassword: boolean;
}

export function createAccount(data: {
  businessName: string;
  categoryId: number;
  businessPhone: string;
  phoneCountryCode: string;
  email: string;
  planId: number;
  password: string;
}) {
  return api.post<AccountData>("/api/account", data);
}

export function getAccount() {
  return api.get<AccountData>("/api/account");
}

export function setPassword(data: { currentPassword?: string; newPassword: string }) {
  return api.post<{ message: string }>("/api/account/password", data);
}

export function linkGoogle(idToken: string) {
  return api.post<{ message: string }>("/api/account/link-google", { idToken });
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

export function requestEmailChange(newEmail: string) {
  return api.post<{ message: string }>("/api/account/email/request-change", { newEmail });
}

export function confirmEmailChange(newEmail: string, code: string) {
  return api.post<{ message: string }>("/api/account/email/confirm-change", { newEmail, code });
}

export function requestPhoneChange(newPhone: string) {
  return api.post<{ message: string }>("/api/account/phone/request-change", { newPhone });
}

export function confirmPhoneChange(newPhone: string, phoneCountryCode: string, code: string) {
  return api.post<{ message: string }>("/api/account/phone/confirm-change", { newPhone, phoneCountryCode, code });
}

// ── Dashboard ──

export interface DashboardOverview {
  plan: string;
  includedMinutes: number;
  minutesUsed: number;
  remainingMinutes: number;
  billingPeriod: string;
  conversationsAnswered: number;
  avgConversationDurationSeconds: number;
  recentConversations: ConversationData[];
}

export function getDashboardOverview() {
  return api.get<DashboardOverview>("/api/dashboard/overview");
}

// ── Calls ──

export interface ConversationData {
  id: string;
  callerName: string | null;
  callerPhone: string;
  dateTimeUtc: string;
  durationSeconds: number;
  language: string;
  summary: string | null;
  status: string;
}

export interface ConversationsPage {
  items: ConversationData[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export function getConversations(page = 1, pageSize = 20, status?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.set("status", status);
  return api.get<ConversationsPage>(`/api/conversations?${params}`);
}

export function getConversation(id: string) {
  return api.get<ConversationData>(`/api/conversations/${id}`);
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

export function getBillingSummary() {
  return api.get<BillingSummary>("/api/billing/summary");
}

export function getPlans() {
  return api.get<PlanData[]>("/api/billing/plans");
}

export function changePlan(planId: number) {
  return api.post<{ message: string; plan: string }>("/api/billing/change-plan", { planId });
}

export function createCheckout(planId: number) {
  return api.post<{ url: string }>("/api/billing/checkout", { planId });
}

export function getInvoices() {
  return api.get<InvoiceData[]>("/api/billing/invoices");
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
  return api.get<FeatureSettings>("/api/features");
}

export function updateFeatureSettings(data: FeatureSettings) {
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

export function getSupportedCountryCodes() {
  return api.get<string[]>("/api/countries/supported");
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
