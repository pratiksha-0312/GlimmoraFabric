-- CreateTable: studio_services
CREATE TABLE "studio_services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "description" TEXT NOT NULL DEFAULT '',
    "endpoint" TEXT NOT NULL DEFAULT '',
    "method" TEXT NOT NULL DEFAULT 'GET',
    "version" TEXT NOT NULL DEFAULT 'v1',
    "status" TEXT NOT NULL DEFAULT 'stable',
    "auth" TEXT NOT NULL DEFAULT 'Bearer',
    "docsMarkdown" TEXT NOT NULL DEFAULT '',
    "sampleRequest" TEXT NOT NULL DEFAULT '',
    "sampleResponse" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_services_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "studio_services_slug_key" ON "studio_services"("slug");
CREATE INDEX "studio_services_category_idx" ON "studio_services"("category");

-- CreateTable: studio_events
CREATE TABLE "studio_events" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'System',
    "description" TEXT NOT NULL DEFAULT '',
    "version" TEXT NOT NULL DEFAULT 'v1',
    "schemaJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "studio_events_key_key" ON "studio_events"("key");
CREATE INDEX "studio_events_category_idx" ON "studio_events"("category");

-- CreateTable: studio_components
CREATE TABLE "studio_components" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'UI',
    "framework" TEXT NOT NULL DEFAULT 'React',
    "description" TEXT NOT NULL DEFAULT '',
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "previewHtml" TEXT NOT NULL DEFAULT '',
    "installCmd" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_components_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "studio_components_slug_key" ON "studio_components"("slug");

-- CreateTable: studio_starters
CREATE TABLE "studio_starters" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Full-stack',
    "description" TEXT NOT NULL DEFAULT '',
    "repoUrl" TEXT NOT NULL DEFAULT '',
    "stars" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'TypeScript',
    "license" TEXT NOT NULL DEFAULT 'MIT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_starters_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "studio_starters_slug_key" ON "studio_starters"("slug");

-- CreateTable: studio_api_keys
CREATE TABLE "studio_api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL DEFAULT 'gf_',
    "keyMasked" TEXT NOT NULL DEFAULT '',
    "scopes" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastUsed" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "studio_api_keys_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "studio_api_keys_status_idx" ON "studio_api_keys"("status");

-- Seed: studio_services
INSERT INTO "studio_services" ("id", "slug", "name", "category", "description", "endpoint", "method", "version", "status", "auth", "docsMarkdown", "sampleRequest", "sampleResponse", "updatedAt") VALUES
('svc-auth-login', 'auth-login', 'Login', 'Auth', 'Authenticate a platform user and return a session token.', '/api/auth/login', 'POST', 'v1', 'stable', 'None',
 '# Login\nExchange credentials for a session. Rate-limited to 20 req/min per IP.',
 '{"email":"user@glimmora.com","password":"••••••••"}',
 '{"fullName":"Vanshika Keswani","email":"user@glimmora.com","role":"super_admin"}', CURRENT_TIMESTAMP),
('svc-auth-mfa', 'auth-mfa-verify', 'Verify MFA', 'Auth', 'Verify a TOTP or recovery code.', '/api/auth/mfa/verify', 'POST', 'v1', 'stable', 'Bearer',
 '# Verify MFA\nSubmit a 6-digit code from the authenticator.',
 '{"code":"123456"}',
 '{"success":true}', CURRENT_TIMESTAMP),
('svc-billing-sub', 'billing-subscription', 'Create Subscription', 'Billing', 'Start a new subscription for a tenant.', '/api/subscriptions', 'POST', 'v1', 'stable', 'Bearer',
 '# Create Subscription\nCreates a Stripe subscription and returns the active plan.',
 '{"tenantId":"tnt-acme","plan":"Pro"}',
 '{"id":"sub_1","plan":"Pro","status":"active"}', CURRENT_TIMESTAMP),
('svc-billing-pay', 'billing-payments', 'List Payments', 'Billing', 'List payments for the current tenant.', '/api/payments', 'GET', 'v1', 'stable', 'Bearer',
 '# List Payments\nReturns the last 50 payments by default.',
 '',
 '[{"id":"pay_1","amount":9900,"currency":"usd","status":"succeeded"}]', CURRENT_TIMESTAMP),
('svc-workflow-list', 'workflow-list', 'List Workflows', 'Workflow', 'List all workflows visible to the caller.', '/api/workflows', 'GET', 'v1', 'stable', 'Bearer', '', '',
 '[{"id":"wf-1","name":"Invoice Approval","status":"Published"}]', CURRENT_TIMESTAMP),
('svc-workflow-run', 'workflow-instance-start', 'Start Workflow Instance', 'Workflow', 'Kick off a new instance of a published workflow.', '/api/workflow-instances', 'POST', 'v1', 'stable', 'Bearer',
 '', '{"workflowId":"wf-1","triggeredBy":"user@tenant.com"}',
 '{"id":"wfi-42","status":"Running","progress":0}', CURRENT_TIMESTAMP),
('svc-doc-generate', 'document-generate', 'Generate Document', 'Document', 'Render a template against a data object and create a document.', '/api/documents', 'POST', 'v1', 'stable', 'Bearer',
 '', '{"templateId":"dt-001","data":{"invoice_id":"INV-001","total":"$420"}}',
 '{"id":"doc-new","name":"Invoice INV-001","status":"generated"}', CURRENT_TIMESTAMP),
('svc-doc-sign', 'document-sign-request', 'Request Signature', 'Document', 'Request an e-signature for a document.', '/api/documents/:id/sign/request', 'POST', 'v1', 'stable', 'Bearer',
 '', '{"signerName":"John Smith","signerEmail":"john@acme.com"}',
 '{"id":"sig_1","status":"pending"}', CURRENT_TIMESTAMP),
('svc-notif-send', 'notifications-send', 'Send Notification', 'Notification', 'Send a transactional notification via the preferred channel.', '/api/notifications', 'POST', 'v1', 'stable', 'Bearer',
 '', '{"templateId":"nt-welcome","recipient":"user@tenant.com","channel":"email"}',
 '{"id":"nt-log-1","status":"delivered"}', CURRENT_TIMESTAMP),
('svc-ai-chat', 'ai-chat', 'AI Chat Completion', 'AI', 'Route a chat completion request through the Glimmora AI gateway.', '/api/ai/chat', 'POST', 'v1', 'beta', 'Bearer',
 '# AI Chat\nSupports OpenAI-compatible message format. Streaming via SSE.',
 '{"model":"gf-medium","messages":[{"role":"user","content":"Hello!"}]}',
 '{"id":"cmpl-1","choices":[{"message":{"role":"assistant","content":"Hi!"}}]}', CURRENT_TIMESTAMP),
('svc-admin-tenants', 'admin-tenants', 'List Tenants', 'Admin', 'Admin-only. Returns all tenants visible to the caller.', '/api/tenants', 'GET', 'v1', 'stable', 'Bearer', '', '',
 '[{"id":"tnt-1","name":"Acme Corp","plan":"Pro","status":"Active"}]', CURRENT_TIMESTAMP),
('svc-files-upload', 'files-upload', 'Upload File', 'General', 'Upload a file and receive a storage URL.', '/api/files/upload', 'POST', 'v1', 'stable', 'Bearer', '', '(multipart/form-data: file)', '{"url":"/uploads/..."}', CURRENT_TIMESTAMP);

-- Seed: studio_events
INSERT INTO "studio_events" ("id", "key", "name", "category", "description", "version", "schemaJson", "updatedAt") VALUES
('evt-user-created', 'user.created', 'User Created', 'User', 'Fired when a new platform user is created.', 'v1',
 '{"id":"string","email":"string","role":"string","createdAt":"iso-datetime"}', CURRENT_TIMESTAMP),
('evt-tenant-suspended', 'tenant.suspended', 'Tenant Suspended', 'System', 'Fired when a tenant is suspended by an admin.', 'v1',
 '{"tenantId":"string","actor":"string","reason":"string","at":"iso-datetime"}', CURRENT_TIMESTAMP),
('evt-payment-succeeded', 'payment.succeeded', 'Payment Succeeded', 'Billing', 'Fired when a payment is successfully captured.', 'v1',
 '{"paymentId":"string","tenantId":"string","amount":"number","currency":"string"}', CURRENT_TIMESTAMP),
('evt-payment-failed', 'payment.failed', 'Payment Failed', 'Billing', 'Fired when a payment fails.', 'v1',
 '{"paymentId":"string","tenantId":"string","reason":"string"}', CURRENT_TIMESTAMP),
('evt-workflow-completed', 'workflow.instance.completed', 'Workflow Instance Completed', 'Workflow', 'Fired when a workflow instance reaches a terminal state.', 'v1',
 '{"instanceId":"string","workflowId":"string","status":"string","durationMs":"number"}', CURRENT_TIMESTAMP),
('evt-workflow-failed', 'workflow.instance.failed', 'Workflow Instance Failed', 'Workflow', 'Fired when a workflow instance fails.', 'v1',
 '{"instanceId":"string","workflowId":"string","error":"string"}', CURRENT_TIMESTAMP),
('evt-doc-signed', 'document.signed', 'Document Signed', 'Document', 'Fired when all signers on a document have signed.', 'v1',
 '{"documentId":"string","signers":"array"}', CURRENT_TIMESTAMP),
('evt-notif-delivered', 'notification.delivered', 'Notification Delivered', 'System', 'Fired when an outbound notification is acknowledged by the provider.', 'v1',
 '{"notificationId":"string","channel":"string","deliveredAt":"iso-datetime"}', CURRENT_TIMESTAMP);

-- Seed: studio_components
INSERT INTO "studio_components" ("id", "slug", "name", "category", "framework", "description", "downloads", "version", "previewHtml", "installCmd", "updatedAt") VALUES
('cmp-button', 'gf-button', 'GF Button', 'UI', 'React', 'Accessible button with sizes, variants, and loading state.', 15420, '2.1.0', '<button class="gf-btn">Click me</button>', 'npx glimmora add gf-button', CURRENT_TIMESTAMP),
('cmp-datatable', 'gf-datatable', 'GF DataTable', 'Data', 'React', 'Sortable, filterable, paginated table built on top of TanStack Table.', 9830, '3.0.2', '', 'npx glimmora add gf-datatable', CURRENT_TIMESTAMP),
('cmp-auth-form', 'gf-auth-form', 'GF Auth Form', 'Auth', 'React', 'Drop-in login / signup form wired to the Glimmora auth API.', 6210, '1.4.0', '', 'npx glimmora add gf-auth-form', CURRENT_TIMESTAMP),
('cmp-pricing', 'gf-pricing-table', 'GF Pricing Table', 'Billing', 'React', 'Responsive pricing table with plan comparison and CTA.', 4180, '1.2.3', '', 'npx glimmora add gf-pricing-table', CURRENT_TIMESTAMP),
('cmp-sidebar', 'gf-sidebar', 'GF Sidebar', 'Layout', 'React', 'Collapsible admin sidebar with nested groups and role gating.', 7450, '2.0.0', '', 'npx glimmora add gf-sidebar', CURRENT_TIMESTAMP),
('cmp-toast', 'gf-toast', 'GF Toast', 'UI', 'React', 'Stackable toast notifications with success, error, and action variants.', 11890, '1.6.1', '', 'npx glimmora add gf-toast', CURRENT_TIMESTAMP),
('cmp-billing-portal', 'gf-billing-portal', 'GF Billing Portal', 'Billing', 'React', 'Embedded billing portal for invoices, subscriptions, and payment methods.', 3120, '1.0.4', '', 'npx glimmora add gf-billing-portal', CURRENT_TIMESTAMP),
('cmp-dropdown', 'gf-dropdown', 'GF Dropdown', 'UI', 'React', 'Headless dropdown primitive with keyboard navigation.', 8570, '1.3.0', '', 'npx glimmora add gf-dropdown', CURRENT_TIMESTAMP);

-- Seed: studio_starters
INSERT INTO "studio_starters" ("id", "slug", "name", "category", "description", "repoUrl", "stars", "language", "license", "updatedAt") VALUES
('str-nextjs-saas', 'nextjs-saas', 'Next.js SaaS Starter', 'Full-stack', 'Next.js 16 + Prisma + Stripe + Glimmora auth wired end-to-end.', 'https://github.com/glimmora/nextjs-saas-starter', 2480, 'TypeScript', 'MIT', CURRENT_TIMESTAMP),
('str-remix', 'remix-starter', 'Remix Starter', 'Full-stack', 'Remix app with Glimmora Fabric SSO, billing, and workflows.', 'https://github.com/glimmora/remix-starter', 870, 'TypeScript', 'MIT', CURRENT_TIMESTAMP),
('str-express', 'express-api-starter', 'Express API Starter', 'Backend', 'Minimal Express + Prisma API connected to Glimmora services.', 'https://github.com/glimmora/express-api-starter', 1340, 'TypeScript', 'MIT', CURRENT_TIMESTAMP),
('str-nest', 'nest-starter', 'NestJS Enterprise Starter', 'Backend', 'NestJS app with modular RBAC, auth gateways, and Prisma adapter.', 'https://github.com/glimmora/nest-starter', 960, 'TypeScript', 'MIT', CURRENT_TIMESTAMP),
('str-react-native', 'react-native-starter', 'React Native Starter', 'Mobile', 'Expo + React Native template with Glimmora auth + push notifications.', 'https://github.com/glimmora/react-native-starter', 720, 'TypeScript', 'MIT', CURRENT_TIMESTAMP),
('str-cli', 'glimmora-cli-plugin', 'Glimmora CLI Plugin Template', 'CLI', 'Scaffold for building a Glimmora CLI plugin in Node.js.', 'https://github.com/glimmora/cli-plugin-template', 310, 'TypeScript', 'Apache-2.0', CURRENT_TIMESTAMP),
('str-astro', 'astro-marketing-starter', 'Astro Marketing Site Starter', 'Frontend', 'Astro-powered marketing site with billing CTA and blog.', 'https://github.com/glimmora/astro-marketing', 540, 'TypeScript', 'MIT', CURRENT_TIMESTAMP);

-- Seed: studio_api_keys
INSERT INTO "studio_api_keys" ("id", "name", "keyPrefix", "keyMasked", "scopes", "status", "lastUsed", "createdBy") VALUES
('sak-001', 'Production Server', 'gf_live_', 'gf_live_••••••••7a2c', '["read:services","read:events","write:workflow"]', 'active', '2026-04-19T22:14:00Z', 'Vanshika Keswani'),
('sak-002', 'Staging Runner', 'gf_test_', 'gf_test_••••••••91ff', '["read:services","write:document"]', 'active', '2026-04-18T10:05:00Z', 'Pratiksha M.'),
('sak-003', 'Analytics Worker', 'gf_live_', 'gf_live_••••••••d03e', '["read:events","read:services"]', 'active', '2026-04-20T08:42:00Z', 'Platform Bot'),
('sak-004', 'Legacy Integration', 'gf_live_', 'gf_live_••••••••c112', '["read:services"]', 'revoked', '2026-03-01T09:30:00Z', 'Vanshika Keswani');
