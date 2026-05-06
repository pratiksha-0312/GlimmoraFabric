// Barrel export for the API client. Import from "@/lib/api".

export { apiClient } from "./client";
export { tokenStorage } from "./token-storage";
export { tenantStorage } from "./tenant-storage";
export { ApiError } from "./types";
export type {
  ApiEnvelope,
  AuthUser,
  TokenPair,
  MfaEnrollData,
  SessionData,
  OAuthProvider,
} from "./types";

// ---- Identity & access ------------------------------------------------------

export { authApi } from "./auth";
export type { LoginInput, LoginResult } from "./auth";

export { usersApi } from "./users";
export type { User, PaginatedUsers, CreateUserInput, UpdateUserInput } from "./users";

export { rolesApi } from "./roles";
export type { Role } from "./roles";

export { sessionsApi } from "./sessions";

export { oauthApi } from "./oauth";
export type { OAuthAccount } from "./oauth";

export { orgsApi } from "./organizations";
export type { Invitation, TenantMember } from "./organizations";

export { magicLinkApi } from "./magic-link";

// ---- Tenants ----------------------------------------------------------------

export { tenantsApi } from "./tenants";
export type {
  Tenant,
  PaginatedTenants,
  CreateTenantInput,
  UpdateTenantInput,
  ListTenantsParams,
  TenantUsage,
} from "./tenants";

// ---- Notifications ----------------------------------------------------------

export { notificationsApi } from "./notifications";
export type {
  SendNotificationInput,
  NotificationLog,
  InAppNotification,
  PaginatedInAppNotifications,
  NotificationPreferences,
  NotificationPreferencesUpdate,
} from "./notifications";

export { smsApi, pushApi, emailApi, whatsappApi } from "./notification-channels";
export type {
  SmsSendResult,
  SmsOtpResult,
  PushDevice,
  PushSendResult,
  DirectEmailInput,
  BatchEmailInput,
  EmailQueueStats,
  WhatsAppTemplate,
  WhatsAppSendResult,
} from "./notification-channels";

export { notificationTemplatesApi } from "./notification-templates";
export type {
  NotificationTemplate,
  TemplateVersion,
  TemplatePreview,
} from "./notification-templates";

// ---- Misc -------------------------------------------------------------------

export { consentApi } from "./consent";
export type { ConsentItem } from "./consent";

export { webhooksApi } from "./webhooks";
export type { Webhook, WebhookCreated, WebhookDelivery } from "./webhooks";

export { auditLogsApi } from "./audit-logs";
export type { AuditLog, AuditLogFilter, CreateAuditLogInput } from "./audit-logs";

// ---- Billing & payments -----------------------------------------------------

export { paymentsApi } from "./payments";
export type {
  Payment,
  PaymentProvider,
  CreatePaymentInput,
  ConfirmPaymentInput,
} from "./payments";

export { invoicesApi } from "./invoices";
export type {
  Invoice,
  CreditNote,
  GenerateInvoiceInput,
  ListInvoicesParams,
} from "./invoices";

export { refundsApi } from "./refunds";
export type { Refund, InitiateRefundInput } from "./refunds";

export { paymentLinksApi, checkoutApi } from "./payment-links";
export type {
  PaymentLink,
  CreatePaymentLinkInput,
  CheckoutDetails,
} from "./payment-links";

export { paymentGatewaysApi } from "./payment-gateways";
export type {
  Gateway,
  GatewayName,
  GatewayHealth,
  ConfigureGatewayInput,
  UpdateGatewayInput,
  RoutingRule,
  CreateRoutingRuleInput,
  BillingAnalytics,
} from "./payment-gateways";

// ---- Plans, subscriptions, entitlements ------------------------------------

export { plansApi } from "./plans";
export type {
  Plan,
  PaginatedPlans,
  CreatePlanInput,
  UpdatePlanInput,
  ListPlansParams,
  BillingCycle,
  PlanFeature,
  PlanFeatureItem,
} from "./plans";

export { subscriptionsApi } from "./subscriptions";
export type {
  Subscription,
  SubscriptionStatus,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  ProrationPreview,
  DunningRecord,
} from "./subscriptions";

export { entitlementsApi } from "./entitlements";
export type { Entitlement } from "./entitlements";

// ---- Workflows --------------------------------------------------------------

export { workflowsApi } from "./workflows";
export type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowStepInput,
  PaginatedWorkflows,
  WorkflowVersion,
  EscalationRule,
  EscalationNotificationType,
  UpsertEscalationRuleInput,
  ApprovalLevelInput,
  ApproverType,
  SLAConfig,
  SLAStatusItem,
} from "./workflows";

export { workflowInstancesApi } from "./workflow-instances";
export type {
  WorkflowInstanceTrigger,
  WorkflowStepExecution,
  ActiveInstance,
  PaginatedActiveInstances,
  InstanceDetail,
} from "./workflow-instances";

export { tasksApi } from "./tasks";
export type {
  TaskItem,
  PaginatedTasks,
  TaskDetail,
  TaskComment,
} from "./tasks";

// ---- Documents --------------------------------------------------------------

export { docTemplatesApi } from "./doc-templates";
export type {
  DocTemplate,
  DocTemplateVersion,
  CreateDocTemplateInput,
  UpdateDocTemplateInput,
  PaginatedDocTemplateVersions,
} from "./doc-templates";

export { docGenerationApi } from "./doc-generation";
export type {
  DocumentFormat,
  GeneratedDocument,
  BatchItemResult,
} from "./doc-generation";

// ---- Platform settings ------------------------------------------------------

export { featureFlagsApi } from "./feature-flags";
export type {
  FeatureFlag,
  PaginatedFeatureFlags,
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
  FeatureFlagOverride,
  Environment,
} from "./feature-flags";

export { configApi } from "./config";
export type {
  ResolvedConfig,
  SetConfigInput,
  SetConfigResult,
  ConfigLevel,
} from "./config";

export { onboardingApi } from "./onboarding";
export type {
  OnboardingResult,
  OnboardingProgress,
  OnboardingStatus,
  UpdateProgressInput,
} from "./onboarding";

// ---- AI ---------------------------------------------------------------------

export { knowledgeApi } from "./knowledge";
export type {
  KnowledgeDocument,
  KnowledgeDocumentListItem,
  PaginatedKnowledgeDocuments,
} from "./knowledge";

export { searchApi } from "./search";
export type { SearchResult, SemanticSearchResponse } from "./search";

export { modelConfigApi } from "./model-config";
export type {
  ModelConfig,
  ModelConfigList,
  UpsertModelConfigInput,
} from "./model-config";

export { guardrailsApi } from "./guardrails";
export type {
  GuardrailRule,
  GuardrailRuleType,
  GuardrailRuleList,
  UpdateGuardrailRuleItem,
} from "./guardrails";

export { aiAnalyticsApi } from "./ai-analytics";
export type {
  GroupByPeriod,
  UsageSummary,
  UsageBreakdown,
  UsageByPeriod,
  UsageByModel,
  UsageLogItem,
  AIUsageAnalytics,
  AIDashboard,
  DashboardModelUsageItem,
  TenantCostItem,
  TenantCostAnalytics,
  PerformanceMetricItem,
  AggregatedModelMetrics,
  PerformanceMetrics,
} from "./ai-analytics";

// ---- Compliance & developer portal ------------------------------------------

export { complianceApi } from "./compliance";
export type {
  ComplianceReport,
  ComplianceReportType,
  RetentionPolicy,
  GDPRDeleteResult,
} from "./compliance";

export {
  serviceCatalogApi,
  sandboxApi,
  sdkDocsApi,
  healthDashboardApi,
  eventCatalogApi,
  componentMarketplaceApi,
} from "./developer-portal";
export type {
  ServiceCatalogItem,
  SandboxMethod,
  SandboxRequestInput,
  SandboxResponse,
} from "./developer-portal";

// ---- ABAC ------------------------------------------------------------------

export { abacApi } from "./abac";
export type {
  ABACPolicy,
  PolicyEffect,
  PolicyConditions,
  ConditionRule,
  CreatePolicyInput,
  UpdatePolicyInput,
  EvaluateInput,
  EvaluateResult,
} from "./abac";

// ---- AI Agents & Prompts ---------------------------------------------------

export { agentsApi } from "./agents";
export type {
  Agent,
  AgentListItem,
  AgentSummary,
  AgentStatus,
  PaginatedAgents,
  CreateAgentInput,
  UpdateAgentInput,
  AgentRun,
  AgentRunStatus,
  AgentExecutionStatus,
  AgentExecutionHistoryItem,
  PaginatedAgentExecutions,
  AgentTool,
  AgentMemoryEntry,
} from "./agents";

export { promptsApi } from "./prompts";
export type {
  Prompt,
  PromptListItem,
  PromptSummary,
  PromptUpdateSummary,
  PromptVersion,
  PaginatedPrompts,
  CreatePromptInput,
  UpdatePromptInput,
  PromptExecution,
  PromptEvaluation,
  CreateEvaluationInput,
} from "./prompts";

// ---- SSO, SMS-MFA, extended API tokens -------------------------------------

export { ssoApi } from "./sso";
export type {
  SSOConfig,
  SSOProtocol,
  ConfigureSSOInput,
  SAMLLoginResponse,
  OIDCDiscovery,
} from "./sso";

export { smsMfaApi } from "./sms-mfa";
export type { SmsOtpSendResult } from "./sms-mfa";

export { apiTokensApi } from "./api-tokens";
export type {
  TokenUsageLog,
  TokenUsageEnvelope,
  TokenUsageSummary,
} from "./api-tokens";

// ---- Real-time notifications -----------------------------------------------

export { connectNotificationSocket } from "./notification-socket";
export type {
  NotificationSocket,
  NotificationSocketState,
  ConnectOptions as NotificationSocketOptions,
} from "./notification-socket";
