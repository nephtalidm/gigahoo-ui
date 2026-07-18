import { mockAccount, mockDashboard, mockConversations, mockBillingSummary, mockPlans } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Error thrown by the api client. Carries the HTTP status and the server's
// machine-readable error code so callers can branch on them (e.g. a 403 with
// code "region_signup_restricted").
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

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
    // Surface the server's machine-readable error code (e.g. "region_signup_restricted")
    // and HTTP status so callers can branch on them.
    const err = new ApiError(
      body.error || body.title || `Request failed (${res.status})`,
      res.status,
      typeof body.error === "string" ? body.error : undefined,
    );
    throw err;
  }

  // 204 / empty responses have no body — res.json() would throw and make a SUCCESSFUL
  // call look failed (a deleted card once stayed on screen until a manual page refresh
  // because the refresh-after-delete was skipped by the phantom error).
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
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

export function googleLogin(idToken: string, country?: string) {
  return api.post<AuthResponse>("/api/auth/google", { idToken, country });
}

export function sendMagicLink(email: string, country?: string) {
  return api.post<{ message: string }>("/api/auth/magic-link", { email, country });
}

export function verifyMagicLink(email: string, code: string) {
  return api.post<AuthResponse>("/api/auth/verify-magic-link", { email, code });
}

export function sendSmsCode(phoneNumber: string, country?: string) {
  return api.post<{ message: string }>("/api/auth/sms/send", { phoneNumber, country });
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
  email: string;
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
  countryCode: string;
  plan: string;
  planId: number;
  includedMinutes: number;
  billingPeriod: string;
  minutesUsed: number;
  createdAt: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  requiresCurrentPassword: boolean;
  emailCallNotifications: boolean;
  smsCallNotifications: boolean;
  greetingMessage: string | null;
  agentVoice: string | null;
  maximumCallMinutes: number | null;
  accountLanguage: string | null;
  timeZone?: string | null;
  collectName?: boolean;
  collectPhone?: boolean;
  collectAddress?: boolean;
  collectEmergency?: boolean;
}

export function createAccount(data: {
  businessName: string;
  categoryId: number;
  businessPhone: string;
  email: string;
  planId: number;
  password: string;
  language: string;
}) {
  return api.post<AccountData>("/api/account", data);
}

// Persist the account's preferred dashboard/website language. Validated against
// the supported locales server-side (400 otherwise).
export function updateAccountLanguage(language: string) {
  return api.put<{ language: string }>("/api/account/language", { language });
}

// DANGER ZONE: deletion is code-confirmed — request sends an email/SMS code, confirm
// echoes it back and performs the permanent teardown.
export function requestAccountDeletion() {
  return api.post<{ message: string }>("/api/account/delete/request");
}

export function confirmAccountDeletion(code: string) {
  return api.post<void>("/api/account/delete/confirm", { code });
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
  email: string;
  websiteUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  regionId: number | null;
  postalCode: string | null;
  countryId: number;
}) {
  return api.put<AccountData>("/api/account", data);
}

export interface NotificationSettings {
  emailCallNotifications: boolean;
  smsCallNotifications: boolean;
}

export function getNotificationSettings() {
  return api.get<NotificationSettings>("/api/account/notifications");
}

export function updateNotificationSettings(s: NotificationSettings) {
  return api.put<void>("/api/account/notifications", s);
}

export interface VoiceSettings {
  greetingMessage: string | null;
  agentVoice: string | null;
  maximumCallMinutes: number | null;
}

export function updateVoiceSettings(s: {
  greetingMessage: string | null;
  agentVoice: string | null;
  maximumCallMinutes: number | null;
}) {
  return api.put<VoiceSettings>("/api/account/voice-settings", s);
}

export interface QuestionsSettings {
  collectName: boolean;
  collectPhone: boolean;
  collectAddress: boolean;
  collectEmergency: boolean;
}

// Which details the AI agent collects (the "Questions" section). Off = don't ask/collect + hide.
export function updateQuestions(s: QuestionsSettings) {
  return api.put<QuestionsSettings>("/api/account/questions", s);
}

export interface AgentVoice {
  apiName: string;
  label: string;
  isDefault: boolean;
  // Fish voices carry gender + the language they speak (picker grouping).
  gender?: string | null;
  language?: string | null;
  // Per-voice instruct "context" options (scenarios/roles/identities). Empty for non-instruct voices.
  options: { key: string; label: string }[];
}

export function getVoices(): Promise<AgentVoice[]> {
  return api.get<AgentVoice[]>("/api/voices");
}

// Synthesize a live voice sample of `text` spoken in `voice` and return the audio
// as a Blob. Uses fetch directly (not the JSON `api` client) so we can request a
// binary response, but reuses the same Bearer-token auth header.
export async function generateVoiceSample(text: string, voice: string, style?: string, instruct?: string): Promise<Blob> {
  const token = typeof window !== "undefined" ? localStorage.getItem("gigahoo_token") : null;
  const res = await fetch(`${API_BASE}/api/voice/sample`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text, voice, style, instruct }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || `Request failed (${res.status})`, res.status);
  }
  return res.blob();
}

export interface SiteSettings {
  defaultGreeting: string | null;
}

export function getSettings() {
  return api.get<SiteSettings>("/api/settings");
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

export function confirmPhoneChange(newPhone: string, code: string) {
  return api.post<{ message: string }>("/api/account/phone/confirm-change", { newPhone, code });
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
  callerPhoneNumber: string;
  dateTimeUtc: string;
  durationSeconds: number;
  language: string;
  summary: string | null;
  address?: string | null;
  isEmergency?: boolean;
  status: string;
}

export interface ConversationsPage {
  items: ConversationData[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// The dashboard's Call History shows PHONE CALLS only (ConversationTypeId 1) — the backend stays
// generic ("conversations") so SMS/WhatsApp receptionists can join later as other type ids.
export function getConversations(page = 1, pageSize = 20, status?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), typeId: "1" });
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
  displayOrder: number;
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

// The visitor's pricing currency (from Country.Currency in the DB), resolved from
// their geo country. Returns { currency: null } if it can't be determined.
export function getCurrencyForVisitor(countryCode: string) {
  return api.get<{ currency: string | null }>(
    `/api/countries/currency?code=${encodeURIComponent(countryCode)}`,
  );
}

// Public, per-currency plan prices for the marketing pricing section. Anonymous
// and resolved from the visitor's geo country (Country.Currency in the DB).
export interface PublicPrices {
  currency: string;
  plans: { slug: string; amount: number }[];
}

export function getPublicPrices(country: string) {
  return api.get<PublicPrices>(
    `/api/billing/public-prices?code=${encodeURIComponent(country)}`,
  );
}

export function changePlan(planId: number) {
  return api.post<{ message: string; plan: string }>("/api/billing/change-plan", { planId });
}

// EMBEDDED plan purchase/upgrade — no hosted page. "active": the saved card was charged (or an
// existing subscription was re-priced). Otherwise the PaymentIntent clientSecret comes back for
// the in-app card form ("requires_payment_method") or a 3DS confirmation ("requires_action").
export function subscribePlan(planId: number) {
  return api.post<{
    status: "active" | "requires_action" | "requires_payment_method";
    clientSecret?: string;
  }>("/api/billing/subscribe", { planId });
}

export function getInvoices() {
  return api.get<InvoiceData[]>("/api/billing/invoices");
}

// ── Payment methods (Stripe Elements, embedded in the dashboard) ──

export interface SetupIntent {
  provider: string;
  clientSecret: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  provider: string;
  isDefault: boolean;
}

// Creates a provider SetupIntent so the dashboard can collect & save a card
// with Stripe Elements. The returned clientSecret is passed to <Elements>.
export function createSetupIntent() {
  return api.post<SetupIntent>("/api/billing/setup-intent");
}

export function getPaymentMethods() {
  return api.get<PaymentMethod[]>("/api/billing/payment-methods");
}

export function removePaymentMethod(id: string, provider: string) {
  return apiRequest<void>(
    `/api/billing/payment-methods/${encodeURIComponent(id)}?provider=${encodeURIComponent(provider)}`,
    { method: "DELETE" },
  );
}

export function setDefaultPaymentMethod(id: string, provider: string) {
  return apiRequest<void>(
    `/api/billing/payment-methods/${encodeURIComponent(id)}/default?provider=${encodeURIComponent(provider)}`,
    { method: "POST" },
  );
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

export function getCountries(supportedOnly = false) {
  return api.get<CountryData[]>(`/api/lookup/countries${supportedOnly ? "?supportedOnly=true" : ""}`);
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
