-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "timezone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "googleUserId" TEXT,
    "gmailAddress" TEXT,
    "preferences" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "contactEmail" TEXT,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InboundEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gmailMessageId" TEXT NOT NULL,
    "gmailThreadId" TEXT,
    "subject" TEXT,
    "snippet" TEXT,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT,
    "ccAddresses" TEXT,
    "bccAddresses" TEXT,
    "receivedAt" DATETIME NOT NULL,
    "rawPayload" TEXT,
    "parsedData" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "classificationConfidence" REAL,
    "processedAt" DATETIME,
    "creatorId" TEXT NOT NULL,
    "brandId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InboundEmail_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InboundEmail_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "brandId" TEXT,
    "inboundEmailId" TEXT,
    "title" TEXT,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_CREATOR',
    "source" TEXT NOT NULL DEFAULT 'EMAIL',
    "estimatedValue" REAL,
    "currencyCode" TEXT DEFAULT 'USD',
    "dueDate" DATETIME,
    "aiConfidence" REAL,
    "aiSummary" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deal_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deal_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deal_inboundEmailId_fkey" FOREIGN KEY ("inboundEmailId") REFERENCES "InboundEmail" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutboundMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "dealId" TEXT,
    "channel" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" TEXT,
    "providerMessageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutboundMessage_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutboundMessage_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GmailCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "googleUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT NOT NULL,
    "scope" TEXT,
    "tokenType" TEXT,
    "expiryDate" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GmailCredential_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_email_key" ON "Creator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_googleUserId_key" ON "Creator"("googleUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_domain_key" ON "Brand"("name", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "InboundEmail_gmailMessageId_key" ON "InboundEmail"("gmailMessageId");

-- CreateIndex
CREATE INDEX "InboundEmail_creatorId_receivedAt_idx" ON "InboundEmail"("creatorId", "receivedAt");

-- CreateIndex
CREATE INDEX "InboundEmail_brandId_idx" ON "InboundEmail"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_inboundEmailId_key" ON "Deal"("inboundEmailId");

-- CreateIndex
CREATE INDEX "Deal_status_idx" ON "Deal"("status");

-- CreateIndex
CREATE INDEX "Deal_creatorId_updatedAt_idx" ON "Deal"("creatorId", "updatedAt");

-- CreateIndex
CREATE INDEX "OutboundMessage_creatorId_createdAt_idx" ON "OutboundMessage"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "OutboundMessage_dealId_idx" ON "OutboundMessage"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "GmailCredential_creatorId_key" ON "GmailCredential"("creatorId");
