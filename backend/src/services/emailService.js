import nodemailer from "nodemailer";
import ENV, { reloadEnv } from "../config/env.js";
import prisma from "../config/prisma.js";
import { generateFrameBillPdf } from "./billPdfGenerator.js";
import { buildCustomerOrderEmail, buildOwnerNotificationEmail } from "./emailTemplates.js";

// In-memory deduplication and outbox delivery tracking
// Key format: `${orderId}:${recipientType}` -> { status, attempts, messageId, accepted, smtpResponse, dispatchedAt, error, simulated }
const dispatchOutbox = new Map();

let cachedTransporter = null;

/**
 * Checks whether SMTP environment variables are properly provided.
 */
export function hasSmtpConfiguration() {
  return Boolean(
    ENV.SMTP_HOST &&
    ENV.SMTP_HOST.trim() &&
    ENV.SMTP_USER &&
    ENV.SMTP_USER.trim() &&
    ENV.SMTP_PASS &&
    ENV.SMTP_PASS.trim()
  );
}

/**
 * Initializes and returns the active nodemailer transporter.
 * If SMTP is configured, creates a pooled real SMTP transport.
 * If SMTP is missing but ENABLE_EMAIL_SIMULATION=true is explicitly set, creates a dev simulation transport.
 * Otherwise returns null to represent an unconfigured email transport.
 */
export function getTransporter({ reload = false } = {}) {
  if (cachedTransporter && !reload) return cachedTransporter;

  const configured = hasSmtpConfiguration();

  if (configured) {
    console.log(`[EmailService] Initializing verified SMTP transporter (${ENV.SMTP_HOST}:${ENV.SMTP_PORT}) for ${ENV.SMTP_USER}`);
    cachedTransporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST.trim(),
      port: Number(ENV.SMTP_PORT) || 587,
      secure: Boolean(ENV.SMTP_SECURE),
      auth: {
        user: ENV.SMTP_USER.trim(),
        pass: ENV.SMTP_PASS.trim(),
      },
      tls: {
        rejectUnauthorized: ENV.NODE_ENV === "production",
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
    cachedTransporter.isSimulated = false;
  } else if (ENV.ENABLE_EMAIL_SIMULATION === true) {
    console.warn(
      "[EmailService] Development simulation EXPLICITLY enabled via ENABLE_EMAIL_SIMULATION=true. Emails will NOT be genuinely sent."
    );
    cachedTransporter = {
      isSimulated: true,
      sendMail: async (mailOptions) => {
        const simulatedMessageId = `<sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@subashstudio.com>`;
        console.log(`[EmailService:Simulated] -----------------------------------------`);
        console.log(`[EmailService:Simulated] TO:        ${mailOptions.to}`);
        console.log(`[EmailService:Simulated] FROM:      ${mailOptions.from}`);
        console.log(`[EmailService:Simulated] REPLY-TO:  ${mailOptions.replyTo}`);
        console.log(`[EmailService:Simulated] SUBJECT:   ${mailOptions.subject}`);
        console.log(`[EmailService:Simulated] MSG ID:    ${simulatedMessageId}`);
        console.log(
          `[EmailService:Simulated] ATTACHMENTS: ${
            mailOptions.attachments?.map((a) => `${a.filename} (${a.content?.length || 0} bytes)`).join(", ") || "None"
          }`
        );
        console.log(`[EmailService:Simulated] -----------------------------------------`);
        return {
          messageId: simulatedMessageId,
          accepted: [], // Never mark as accepted by SMTP in simulation
          rejected: [mailOptions.to],
          response: "Simulated log only: ENABLE_EMAIL_SIMULATION is true. No email was dispatched to MTA.",
          simulated: true,
        };
      },
      verify: async () => {
        return { ok: false, simulated: true, message: "Simulated transport - not a real SMTP connection." };
      },
    };
  } else {
    // Unconfigured state: No SMTP credentials and simulation is not explicitly enabled
    cachedTransporter = null;
  }

  return cachedTransporter;
}

/**
 * Verifies transporter connectivity and TLS handshake.
 * Reports actual SMTP errors without leaking credentials.
 */
export async function verifyTransport() {
  const currentEnv = reloadEnv();
  const configured = hasSmtpConfiguration();

  if (!configured) {
    if (currentEnv.ENABLE_EMAIL_SIMULATION) {
      return {
        ok: false,
        simulated: true,
        error: "SMTP not configured: simulation is explicitly enabled but no real SMTP server is connected.",
      };
    }
    return {
      ok: false,
      simulated: false,
      error: "SMTP configuration incomplete: missing SMTP_HOST, SMTP_USER, or SMTP_PASS in environment.",
    };
  }

  try {
    const transporter = getTransporter({ reload: true });
    if (!transporter || transporter.isSimulated) {
      return {
        ok: false,
        simulated: Boolean(transporter?.isSimulated),
        error: "Failed to initialize active SMTP transporter.",
      };
    }

    await transporter.verify();
    console.log(`[EmailService] ✓ SMTP connection to ${currentEnv.SMTP_HOST} verified successfully.`);
    return {
      ok: true,
      simulated: false,
      host: currentEnv.SMTP_HOST,
      port: currentEnv.SMTP_PORT,
      user: currentEnv.SMTP_USER,
      message: "SMTP connection and authentication verified successfully.",
    };
  } catch (err) {
    // Report meaningful diagnostic error without logging passwords
    console.error(`[EmailService] ✗ SMTP verification failed: ${err.message} (code: ${err.code || "N/A"})`);
    return {
      ok: false,
      simulated: false,
      error: err.message,
      code: err.code || null,
      response: err.response || null,
      command: err.command || null,
    };
  }
}

/**
 * Resolves authoritative studio metadata, contact details, and the studio owner's email address.
 * Never depends on an admin session or hardcoded developer address.
 */
export async function resolveStudioMetadata() {
  try {
    const [settingsList, websiteContentList, adminUser] = await Promise.all([
      prisma.studioSettings.findMany(),
      prisma.websiteContent.findMany(),
      prisma.adminUser.findFirst({ orderBy: { createdAt: "asc" } }),
    ]);

    const settingsMap = {};
    settingsList.forEach((s) => {
      settingsMap[s.section] = s.data || {};
    });

    const contentMap = {};
    websiteContentList.forEach((c) => {
      contentMap[c.section] = c.data || {};
    });

    const profileData = settingsMap.profile || {};
    const studioData = settingsMap.studio || {};
    const contactData = contentMap.contact || {};

    const ownerEmail =
      (profileData.email && profileData.email.trim()) ||
      (adminUser?.email && adminUser.email.trim()) ||
      ENV.INITIAL_ADMIN_EMAIL ||
      "subashstudio009@gmail.com";

    const studioName = studioData.studioName || "SUBASH STUDIO";
    const phone = contactData.phone || profileData.phone || "+91 93457 06609";
    const whatsapp = contactData.whatsapp || phone;
    const email = contactData.email || ownerEmail;

    return {
      ownerEmail,
      studioName,
      phone,
      whatsapp,
      email,
      gstNumber: studioData.gstNumber || "33AAAAA0000A1Z5",
      tagline: studioData.tagline || "Fine Photography & Cinematic Films",
    };
  } catch (err) {
    console.warn("[EmailService] Warning: Failed to fetch studio metadata from DB. Using fallback defaults:", err.message);
    return {
      ownerEmail: ENV.INITIAL_ADMIN_EMAIL || "subashstudio009@gmail.com",
      studioName: "SUBASH STUDIO",
      phone: "+91 93457 06609",
      whatsapp: "+91 93457 06609",
      email: "subashstudio009@gmail.com",
      gstNumber: "33AAAAA0000A1Z5",
      tagline: "Fine Photography & Cinematic Films",
    };
  }
}

/**
 * Helper to execute mail sending with bounded retry on transient failure.
 */
async function sendWithRetry(transporter, mailOptions, maxRetries = 2) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    attempt++;
    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, info, attempt };
    } catch (err) {
      lastError = err;
      console.warn(
        `[EmailService] Attempt ${attempt}/${maxRetries + 1} failed for ${mailOptions.to}: ${err.message}`
      );
      if (attempt <= maxRetries) {
        // Exponential backoff
        await new Promise((res) => setTimeout(res, 500 * Math.pow(2, attempt - 1)));
      }
    }
  }

  return { success: false, error: lastError, attempt };
}

/**
 * Sends order confirmation and bill to the customer.
 */
async function dispatchCustomerEmail({ order, pdfBuffer, studioInfo, transporter, force = false }) {
  const customerEmail = (order.email || "").trim();
  if (!customerEmail || !customerEmail.includes("@")) {
    console.warn(`[EmailService] Cannot send customer bill: Order #${order.id} has no valid email (${customerEmail}).`);
    return {
      sent: false,
      recipient: customerEmail,
      status: "INVALID_EMAIL",
      error: "Invalid or missing customer email on order record",
    };
  }

  const outboxKey = `${order.id}:customer`;

  // Deduplication check: ONLY block if a real, genuine SMTP send succeeded and force is false
  if (!force) {
    const existingDispatch = dispatchOutbox.get(outboxKey);
    if (existingDispatch && existingDispatch.status === "DELIVERED" && !existingDispatch.simulated) {
      console.log(`[EmailService] Duplicate send skipped: Customer bill for #${order.id} already delivered (${existingDispatch.messageId}).`);
      return {
        sent: true,
        deduplicated: true,
        recipient: customerEmail,
        messageId: existingDispatch.messageId,
        smtpResponse: existingDispatch.smtpResponse,
        accepted: existingDispatch.accepted,
      };
    }
  }

  // Handle unconfigured SMTP transport honestly
  if (!transporter) {
    console.warn(`[EmailService] SMTP not configured. Customer bill for #${order.id} was NOT dispatched.`);
    return {
      sent: false,
      recipient: customerEmail,
      status: "UNCONFIGURED",
      error: "SMTP delivery not configured: missing SMTP_HOST, SMTP_USER, or SMTP_PASS in environment.",
    };
  }

  // Handle explicit development simulation honestly: NEVER claim sent: true
  if (transporter.isSimulated) {
    const simInfo = await transporter.sendMail({
      to: customerEmail,
      from: ENV.EMAIL_FROM,
      replyTo: ENV.EMAIL_REPLY_TO || studioInfo.email,
      subject: `SUBASH STUDIO — Frame Order Bill #${order.id}`,
    });
    // Record simulated status in outbox WITHOUT DELIVERED, so it never blocks real sends
    dispatchOutbox.set(outboxKey, {
      status: "SIMULATED",
      simulated: true,
      messageId: simInfo.messageId,
      dispatchedAt: new Date().toISOString(),
    });
    return {
      sent: false,
      simulated: true,
      recipient: customerEmail,
      status: "SIMULATED",
      messageId: simInfo.messageId,
      error: "Simulation mode active: email logged locally but NOT genuinely sent via SMTP.",
    };
  }

  const { subject, html, text } = buildCustomerOrderEmail(order, studioInfo);
  const pdfFilename = `SUBASH_STUDIO_Bill_${order.id}.pdf`;

  const mailOptions = {
    from: ENV.EMAIL_FROM,
    to: customerEmail,
    replyTo: ENV.EMAIL_REPLY_TO || studioInfo.email,
    subject,
    text,
    html,
    attachments: [
      {
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
    headers: {
      "X-Entity-Ref-ID": `FrameOrder-${order.id}`,
      "X-Studio-Order-ID": String(order.id),
      "Auto-Submitted": "auto-generated",
    },
  };

  const result = await sendWithRetry(transporter, mailOptions);

  if (result.success) {
    const info = result.info;
    const isAccepted = Array.isArray(info.accepted) && info.accepted.some((r) => r.toLowerCase().includes(customerEmail.toLowerCase()));
    const isRejected = Array.isArray(info.rejected) && info.rejected.some((r) => r.toLowerCase().includes(customerEmail.toLowerCase()));

    if (isRejected || (!isAccepted && info.accepted?.length === 0)) {
      dispatchOutbox.set(outboxKey, {
        status: "REJECTED_BY_SMTP",
        attempts: result.attempt,
        recipient: customerEmail,
        rejected: info.rejected,
        smtpResponse: info.response,
        dispatchedAt: new Date().toISOString(),
      });
      console.error(`[EmailService] ✗ Customer recipient rejected by SMTP server for #${order.id}:`, info.response);
      return {
        sent: false,
        recipient: customerEmail,
        status: "REJECTED_BY_SMTP",
        error: `Recipient rejected by SMTP server: ${info.response || "No response details"}`,
        accepted: info.accepted || [],
        rejected: info.rejected || [],
        smtpResponse: info.response,
        attempts: result.attempt,
      };
    }

    dispatchOutbox.set(outboxKey, {
      status: "DELIVERED",
      attempts: result.attempt,
      messageId: info.messageId,
      accepted: info.accepted,
      smtpResponse: info.response,
      dispatchedAt: new Date().toISOString(),
      simulated: false,
    });
    console.log(`[EmailService] ✓ Customer bill accepted by SMTP for #${order.id} to ${customerEmail} (MessageId: ${info.messageId})`);
    return {
      sent: true,
      recipient: customerEmail,
      messageId: info.messageId,
      smtpResponse: info.response,
      accepted: info.accepted,
      rejected: info.rejected || [],
      attempts: result.attempt,
    };
  } else {
    dispatchOutbox.set(outboxKey, {
      status: "FAILED",
      attempts: result.attempt,
      error: result.error?.message,
      dispatchedAt: new Date().toISOString(),
      simulated: false,
    });
    console.error(`[EmailService] ✗ Customer bill delivery failed for #${order.id} to ${customerEmail}:`, result.error?.message);
    return {
      sent: false,
      recipient: customerEmail,
      status: "FAILED",
      error: result.error?.message || "Delivery failed",
      attempts: result.attempt,
    };
  }
}

/**
 * Sends order notification and bill to the studio owner/admin.
 */
async function dispatchOwnerEmail({ order, pdfBuffer, studioInfo, transporter, force = false }) {
  const ownerEmail = (studioInfo.ownerEmail || "").trim();
  if (!ownerEmail || !ownerEmail.includes("@")) {
    console.warn(`[EmailService] Cannot send owner alert: Studio owner email could not be resolved.`);
    return {
      sent: false,
      recipient: ownerEmail,
      status: "INVALID_EMAIL",
      error: "Authoritative studio owner email address not configured",
    };
  }

  const outboxKey = `${order.id}:owner`;

  // Deduplication check: ONLY block if a real, genuine SMTP send succeeded and force is false
  if (!force) {
    const existingDispatch = dispatchOutbox.get(outboxKey);
    if (existingDispatch && existingDispatch.status === "DELIVERED" && !existingDispatch.simulated) {
      console.log(`[EmailService] Duplicate send skipped: Owner notification for #${order.id} already delivered (${existingDispatch.messageId}).`);
      return {
        sent: true,
        deduplicated: true,
        recipient: ownerEmail,
        messageId: existingDispatch.messageId,
        smtpResponse: existingDispatch.smtpResponse,
        accepted: existingDispatch.accepted,
      };
    }
  }

  // Handle unconfigured SMTP transport honestly
  if (!transporter) {
    console.warn(`[EmailService] SMTP not configured. Owner alert for #${order.id} was NOT dispatched.`);
    return {
      sent: false,
      recipient: ownerEmail,
      status: "UNCONFIGURED",
      error: "SMTP delivery not configured: missing SMTP_HOST, SMTP_USER, or SMTP_PASS in environment.",
    };
  }

  // Handle explicit development simulation honestly: NEVER claim sent: true
  if (transporter.isSimulated) {
    const simInfo = await transporter.sendMail({
      to: ownerEmail,
      from: ENV.EMAIL_FROM,
      replyTo: (order.email && order.email.includes("@")) ? order.email : (ENV.EMAIL_REPLY_TO || studioInfo.email),
      subject: `SUBASH STUDIO — New Frame Order #${order.id}`,
    });
    dispatchOutbox.set(outboxKey, {
      status: "SIMULATED",
      simulated: true,
      messageId: simInfo.messageId,
      dispatchedAt: new Date().toISOString(),
    });
    return {
      sent: false,
      simulated: true,
      recipient: ownerEmail,
      status: "SIMULATED",
      messageId: simInfo.messageId,
      error: "Simulation mode active: email logged locally but NOT genuinely sent via SMTP.",
    };
  }

  const { subject, html, text } = buildOwnerNotificationEmail(order, studioInfo);
  const pdfFilename = `SUBASH_STUDIO_Bill_${order.id}.pdf`;

  const mailOptions = {
    from: ENV.EMAIL_FROM,
    to: ownerEmail,
    replyTo: (order.email && order.email.includes("@")) ? order.email : (ENV.EMAIL_REPLY_TO || studioInfo.email),
    subject,
    text,
    html,
    attachments: [
      {
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
    headers: {
      "X-Entity-Ref-ID": `FrameOrder-${order.id}-AdminAlert`,
      "X-Studio-Order-ID": String(order.id),
      "Auto-Submitted": "auto-generated",
    },
  };

  const result = await sendWithRetry(transporter, mailOptions);

  if (result.success) {
    const info = result.info;
    const isAccepted = Array.isArray(info.accepted) && info.accepted.some((r) => r.toLowerCase().includes(ownerEmail.toLowerCase()));
    const isRejected = Array.isArray(info.rejected) && info.rejected.some((r) => r.toLowerCase().includes(ownerEmail.toLowerCase()));

    if (isRejected || (!isAccepted && info.accepted?.length === 0)) {
      dispatchOutbox.set(outboxKey, {
        status: "REJECTED_BY_SMTP",
        attempts: result.attempt,
        recipient: ownerEmail,
        rejected: info.rejected,
        smtpResponse: info.response,
        dispatchedAt: new Date().toISOString(),
      });
      console.error(`[EmailService] ✗ Owner recipient rejected by SMTP server for #${order.id}:`, info.response);
      return {
        sent: false,
        recipient: ownerEmail,
        status: "REJECTED_BY_SMTP",
        error: `Recipient rejected by SMTP server: ${info.response || "No response details"}`,
        accepted: info.accepted || [],
        rejected: info.rejected || [],
        smtpResponse: info.response,
        attempts: result.attempt,
      };
    }

    dispatchOutbox.set(outboxKey, {
      status: "DELIVERED",
      attempts: result.attempt,
      messageId: info.messageId,
      accepted: info.accepted,
      smtpResponse: info.response,
      dispatchedAt: new Date().toISOString(),
      simulated: false,
    });
    console.log(`[EmailService] ✓ Studio owner notification accepted by SMTP for #${order.id} to ${ownerEmail} (MessageId: ${info.messageId})`);
    return {
      sent: true,
      recipient: ownerEmail,
      messageId: info.messageId,
      smtpResponse: info.response,
      accepted: info.accepted,
      rejected: info.rejected || [],
      attempts: result.attempt,
    };
  } else {
    dispatchOutbox.set(outboxKey, {
      status: "FAILED",
      attempts: result.attempt,
      error: result.error?.message,
      dispatchedAt: new Date().toISOString(),
      simulated: false,
    });
    console.error(`[EmailService] ✗ Studio owner notification failed for #${order.id} to ${ownerEmail}:`, result.error?.message);
    return {
      sent: false,
      recipient: ownerEmail,
      status: "FAILED",
      error: result.error?.message || "Delivery failed",
      attempts: result.attempt,
    };
  }
}

/**
 * Main transactional email dispatcher triggered after successful frame order persistence or admin resend.
 * Dispatches two independent emails (Customer bill + Studio owner alert), both containing the PDF bill.
 * Never lets an email transport failure crash or abort the saved order.
 * 
 * @param {Object} params
 * @param {Object} params.order - The saved FrameOrder from PostgreSQL.
 * @param {Buffer} [params.pdfBuffer] - Optional pre-generated bill PDF Buffer.
 * @param {boolean} [params.force=false] - If true, bypasses deduplication checks for manual resends.
 * @returns {Promise<Object>} Results of both delivery attempts.
 */
export async function sendOrderNotifications({ order, pdfBuffer = null, force = false }) {
  if (!order || !order.id) {
    console.error("[EmailService] sendOrderNotifications called with invalid order object.");
    return {
      customer: { sent: false, error: "Missing order data" },
      owner: { sent: false, error: "Missing order data" },
    };
  }

  try {
    const transporter = getTransporter();
    const studioInfo = await resolveStudioMetadata();

    // 1. Generate the official PDF bill if not pre-provided
    let billPdf = pdfBuffer;
    if (!billPdf) {
      try {
        billPdf = await generateFrameBillPdf(order, studioInfo);
      } catch (pdfErr) {
        console.error(`[EmailService] Failed to generate bill PDF for #${order.id}:`, pdfErr.message);
        billPdf = Buffer.from("");
      }
    }

    // 2. Dispatch both emails independently using Promise.allSettled
    // Failure to send one must not block or prevent the other!
    const [customerSettled, ownerSettled] = await Promise.allSettled([
      dispatchCustomerEmail({ order, pdfBuffer: billPdf, studioInfo, transporter, force }),
      dispatchOwnerEmail({ order, pdfBuffer: billPdf, studioInfo, transporter, force }),
    ]);

    const customerResult = customerSettled.status === "fulfilled"
      ? customerSettled.value
      : { sent: false, error: customerSettled.reason?.message || "Customer dispatch rejected" };

    const ownerResult = ownerSettled.status === "fulfilled"
      ? ownerSettled.value
      : { sent: false, error: ownerSettled.reason?.message || "Owner dispatch rejected" };

    return {
      orderId: order.id,
      customer: customerResult,
      owner: ownerResult,
    };
  } catch (err) {
    console.error(`[EmailService] Critical unexpected error during order notifications for #${order.id}:`, err);
    return {
      orderId: order.id,
      customer: { sent: false, error: err.message },
      owner: { sent: false, error: err.message },
    };
  }
}

export default {
  hasSmtpConfiguration,
  getTransporter,
  verifyTransport,
  resolveStudioMetadata,
  sendOrderNotifications,
};
