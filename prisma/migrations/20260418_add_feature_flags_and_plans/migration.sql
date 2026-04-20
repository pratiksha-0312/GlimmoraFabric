-- CreateTable: plans (previously in schema but never migrated)
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "billingCycle" TEXT NOT NULL DEFAULT 'Monthly',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "features" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");

-- CreateTable: feature_flags
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 0,
    "environment" TEXT NOT NULL DEFAULT 'Production',
    "category" TEXT NOT NULL DEFAULT 'Feature',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateTable: feature_flag_overrides
CREATE TABLE "feature_flag_overrides" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "tenantCode" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flag_overrides_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "feature_flag_overrides_flagId_tenantCode_key"
  ON "feature_flag_overrides"("flagId", "tenantCode");

CREATE INDEX "feature_flag_overrides_flagId_idx" ON "feature_flag_overrides"("flagId");

ALTER TABLE "feature_flag_overrides" ADD CONSTRAINT "feature_flag_overrides_flagId_fkey"
  FOREIGN KEY ("flagId") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: plans (match prior hardcoded /api/plans set)
INSERT INTO "plans" ("id", "name", "slug", "price", "billingCycle", "currency", "features", "isActive", "sortOrder", "updatedAt") VALUES
('p1', 'Starter', 'starter', 29, 'Monthly', 'USD',
 '["Up to 5 users","Basic AI Platform","10 Workflows","5 GB Document Storage","Email Support"]',
 true, 1, CURRENT_TIMESTAMP),
('p2', 'Pro', 'pro', 99, 'Monthly', 'USD',
 '["Up to 25 users","Advanced AI Platform","Unlimited Workflows","50 GB Document Storage","API Access","Priority Support"]',
 true, 2, CURRENT_TIMESTAMP),
('p3', 'Enterprise', 'enterprise', 249, 'Monthly', 'USD',
 '["Unlimited users","Enterprise AI Platform","Unlimited Workflows","500 GB Document Storage","Full API Access","Dedicated Support","SSO & SAML","Custom SLA"]',
 true, 3, CURRENT_TIMESTAMP);

-- Seed: feature_flags
INSERT INTO "feature_flags" ("id", "key", "name", "description", "enabled", "rolloutPercentage", "environment", "category", "createdAt", "updatedAt") VALUES
('ff1', 'ai_copilot_v2', 'AI Copilot V2', 'Next-gen AI copilot with multi-modal support', true, 75, 'Production', 'Feature', '2026-02-10T00:00:00Z', '2026-03-28T00:00:00Z'),
('ff2', 'new_billing_flow', 'New Billing Flow', 'Redesigned billing checkout with Stripe integration', true, 100, 'Production', 'Release', '2026-01-15T00:00:00Z', '2026-03-01T00:00:00Z'),
('ff3', 'dark_mode_v3', 'Dark Mode V3', 'Updated dark theme with improved contrast ratios', true, 50, 'Staging', 'Experiment', '2026-03-05T00:00:00Z', '2026-03-30T00:00:00Z'),
('ff4', 'maintenance_banner', 'Maintenance Banner', 'Show scheduled maintenance notification to all users', false, 0, 'Production', 'Ops', '2026-03-20T00:00:00Z', '2026-03-20T00:00:00Z'),
('ff5', 'bulk_export_api', 'Bulk Export API', 'Allow bulk export of tenant data via new API endpoint', true, 25, 'Development', 'Feature', '2026-03-15T00:00:00Z', '2026-04-02T00:00:00Z'),
('ff6', 'advanced_analytics', 'Advanced Analytics', 'Expanded analytics dashboard with cohort analysis', false, 10, 'Staging', 'Experiment', '2026-02-28T00:00:00Z', '2026-03-25T00:00:00Z');

-- Seed: feature_flag_overrides
INSERT INTO "feature_flag_overrides" ("id", "flagId", "tenantCode", "tenantName", "enabled") VALUES
('ffo1', 'ff1', 'TENT001', 'Acme Corporation', true),
('ffo2', 'ff1', 'TENT004', 'Wonka Ltd', false),
('ffo3', 'ff3', 'TENT002', 'Globex Inc', true),
('ffo4', 'ff5', 'TENT001', 'Acme Corporation', true);
