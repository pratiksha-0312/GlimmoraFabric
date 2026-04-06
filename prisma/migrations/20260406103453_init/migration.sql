-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'Starter',
    "users" INTEGER NOT NULL DEFAULT 0,
    "region" TEXT NOT NULL DEFAULT 'US-East',
    "domain" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Provisioning',
    "apiCalls" TEXT NOT NULL DEFAULT '—',
    "description" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'tenant_member',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "mfa" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TEXT NOT NULL DEFAULT '—',
    "tenant" TEXT NOT NULL DEFAULT '',
    "tenantId" TEXT,
    "joinedDate" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "platform_users" ADD CONSTRAINT "platform_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
