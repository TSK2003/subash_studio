/**
 * Email templates for Subash Studio custom frame orders.
 * Provides both rich responsive HTML and accessible plain-text alternatives.
 */

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
}

function formatDate(dateInput) {
  if (!dateInput) return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return String(dateInput);
  }
}

/**
 * Extracts normalized item array from a FrameOrder.
 */
function extractItems(order) {
  if (Array.isArray(order.items) && order.items.length > 0) return order.items;
  if (Array.isArray(order.orderItems) && order.orderItems.length > 0) return order.orderItems;
  return [
    {
      woodType: order.woodType,
      woodPrice: order.woodPrice,
      frameDesign: order.frameDesign,
      designPrice: order.designPrice,
      frameRatio: order.frameRatio,
      ratioPrice: order.ratioPrice,
      orientation: order.orientation,
      quantity: order.quantity || 1,
      unitPrice: order.unitPrice,
      totalAmount: order.totalAmount,
    },
  ];
}

/**
 * Generates the Customer Order Confirmation & Bill email.
 */
export function buildCustomerOrderEmail(order, studioInfo = {}) {
  const items = extractItems(order);
  const formattedDate = formatDate(order.createdAt);
  const formattedTotal = formatCurrency(order.totalAmount);
  const phone = studioInfo.phone || "+91 93457 06609";
  const email = studioInfo.email || "subashstudio009@gmail.com";
  const subject = `SUBASH STUDIO — Frame Order Bill #${order.id}`;

  const itemsHtml = items
    .map((item, idx) => {
      const wood = item.wood?.name || item.woodType || "Premium Timber";
      const design = item.design?.name || item.frameDesign || "Classic Finish";
      const ratio = item.ratio?.name || item.frameRatio || "Standard Size";
      const orientation = (item.orientation || "portrait").toUpperCase();
      const qty = item.quantity || 1;
      const total = formatCurrency(item.totalAmount || item.unitPrice * qty);

      return `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #EFEAE3; font-size: 13px; color: #1C1B19;">
          <strong>Frame #${idx + 1}: ${wood}</strong><br/>
          <span style="font-size: 12px; color: #6E685F;">
            Profile: ${design} &bull; Dimensions: ${ratio} (${orientation})
          </span>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #EFEAE3; font-size: 13px; color: #1C1B19; text-align: center;">
          ${qty}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #EFEAE3; font-size: 13px; font-weight: bold; color: #1C1B19; text-align: right; font-family: monospace;">
          ${total}
        </td>
      </tr>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1B19;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F5F0; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #FFFFFF; border: 1px solid #E7E0D2; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 30px 24px; text-align: center; background-color: #FAF8F5; border-bottom: 1px solid #EFEAE3;">
              <div style="font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #8C6D32; text-transform: uppercase; margin-bottom: 6px;">
                ATELIER WOODCRAFT &amp; FRAMING
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #1C1B19; text-transform: uppercase;">
                SUBASH STUDIO
              </h1>
              <p style="margin: 6px 0 0; font-size: 12px; color: #7A746B; font-style: italic;">
                Fine Photography &amp; Cinematic Films &bull; Est. 1993
              </p>
            </td>
          </tr>

          <!-- Greeting & Confirmation -->
          <tr>
            <td style="padding: 28px 30px 10px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; color: #1C1B19; font-weight: 700;">
                Thank you for your order, ${order.customerName}!
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #4A463F;">
                We have received your custom frame order and our craftsmen have queued it for production. Your official invoice/bill is attached to this email as a PDF document for your records.
              </p>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; border: 1px solid #EFEAE3; border-radius: 8px; padding: 16px;">
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Order ID:</td>
                  <td style="font-size: 13px; font-weight: bold; color: #1C1B19; text-align: right; font-family: monospace; padding-bottom: 6px;">#${order.id}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Order Date:</td>
                  <td style="font-size: 12px; color: #1C1B19; text-align: right; padding-bottom: 6px;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Fulfillment Type:</td>
                  <td style="font-size: 12px; font-weight: 600; color: #1C1B19; text-align: right; padding-bottom: 6px;">${order.deliveryType || "Home Delivery"}</td>
                </tr>
                ${order.address ? `
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Delivery Address:</td>
                  <td style="font-size: 12px; color: #1C1B19; text-align: right; padding-bottom: 6px; max-width: 250px;">${order.address}</td>
                </tr>` : ""}
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Payment Status:</td>
                  <td style="font-size: 12px; font-weight: bold; color: #8C6D32; text-align: right; padding-bottom: 6px;">${order.status === "DELIVERED" ? "PAID" : "PENDING (ON DELIVERY / PICKUP)"}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; font-weight: bold; color: #1C1B19; padding-top: 8px; border-top: 1px dashed #DDD6CA;">Grand Total:</td>
                  <td style="font-size: 16px; font-weight: bold; color: #1C1B19; text-align: right; font-family: monospace; padding-top: 8px; border-top: 1px dashed #DDD6CA;">${formattedTotal}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 30px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #8C6D32; font-weight: 700;">
                Ordered Frame Specifications
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #EFEAE3; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #FAF8F5;">
                    <th style="padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; color: #7A746B; border-bottom: 1px solid #EFEAE3;">Item Details</th>
                    <th style="padding: 10px 14px; text-align: center; font-size: 11px; text-transform: uppercase; color: #7A746B; border-bottom: 1px solid #EFEAE3;">Qty</th>
                    <th style="padding: 10px 14px; text-align: right; font-size: 11px; text-transform: uppercase; color: #7A746B; border-bottom: 1px solid #EFEAE3;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Attachment Notice Banner -->
          <tr>
            <td style="padding: 0 30px 28px;">
              <div style="background-color: #F2EFE9; border: 1px solid #DDD7CE; border-radius: 8px; padding: 14px 16px; display: flex; align-items: center;">
                <span style="font-size: 18px; margin-right: 12px;">📎</span>
                <div style="font-size: 12px; color: #4A463F; line-height: 1.5;">
                  <strong>Official Invoice Attached:</strong><br/>
                  Please see the attached PDF <em>SUBASH_STUDIO_Bill_${order.id}.pdf</em> for your itemized breakdown and official record.
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; text-align: center; background-color: #FAF8F5; border-top: 1px solid #EFEAE3; font-size: 11px; color: #7A746B; line-height: 1.6;">
              <strong style="color: #1C1B19;">SUBASH STUDIO</strong> &bull; Tirunelveli &bull; Kalladaikurichi &bull; Tenkasi<br/>
              Direct Inquiries: <a href="tel:${phone}" style="color: #8C6D32; text-decoration: none;">${phone}</a> &bull; 
              <a href="mailto:${email}" style="color: #8C6D32; text-decoration: none;">${email}</a><br/>
              <span style="font-size: 10px; color: #9A948A; display: inline-block; margin-top: 8px;">
                This is an automated transactional order notification from SUBASH STUDIO.
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const itemsText = items
    .map((item, idx) => {
      const wood = item.wood?.name || item.woodType || "Premium Timber";
      const design = item.design?.name || item.frameDesign || "Classic Finish";
      const ratio = item.ratio?.name || item.frameRatio || "Standard Size";
      const orientation = (item.orientation || "portrait").toUpperCase();
      const qty = item.quantity || 1;
      const total = formatCurrency(item.totalAmount || item.unitPrice * qty);
      return `  ${idx + 1}. ${wood} (Profile: ${design}, Size: ${ratio}, Orientation: ${orientation}) - Qty: ${qty} - Total: ${total}`;
    })
    .join("\n");

  const text = `
SUBASH STUDIO — CUSTOM FRAME ORDER BILL
=====================================================
Thank you for your order, ${order.customerName}!

ORDER DETAILS:
- Order ID: #${order.id}
- Order Date: ${formattedDate}
- Customer Name: ${order.customerName}
- Phone: ${order.phone}
- Email: ${order.email}
- Fulfillment: ${order.deliveryType || "Home Delivery"}
${order.address ? `- Delivery Address: ${order.address}\n` : ""}${order.notes ? `- Notes: ${order.notes}\n` : ""}- Status: ${order.status || "NEW"}
- Grand Total: ${formattedTotal}

ORDERED FRAMES:
${itemsText}

ATTACHMENT:
Your official computer-generated invoice PDF has been attached to this email:
SUBASH_STUDIO_Bill_${order.id}.pdf

CONTACT US:
SUBASH STUDIO — Atelier Woodcraft & Framing
Phone: ${phone}
Email: ${email}
Locations: Tirunelveli Atelier • Kalladaikurichi Heritage Studio • Tenkasi
=====================================================
`;

  return { subject, html, text };
}

/**
 * Generates the Studio Owner / Admin Notification email.
 */
export function buildOwnerNotificationEmail(order, studioInfo = {}) {
  const items = extractItems(order);
  const formattedDate = formatDate(order.createdAt);
  const formattedTotal = formatCurrency(order.totalAmount);
  const phone = studioInfo.phone || "+91 93457 06609";
  const subject = `SUBASH STUDIO — New Frame Order #${order.id}`;

  const itemsHtml = items
    .map((item, idx) => {
      const wood = item.wood?.name || item.woodType || "Premium Timber";
      const design = item.design?.name || item.frameDesign || "Classic Finish";
      const ratio = item.ratio?.name || item.frameRatio || "Standard Size";
      const orientation = (item.orientation || "portrait").toUpperCase();
      const qty = item.quantity || 1;
      const total = formatCurrency(item.totalAmount || item.unitPrice * qty);

      return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #EFEAE3; font-size: 13px; color: #1C1B19;">
          <strong>#${idx + 1}: ${wood}</strong> &bull; ${design} (${ratio}, ${orientation})
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #EFEAE3; font-size: 13px; text-align: center;">
          ${qty}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #EFEAE3; font-size: 13px; font-weight: bold; text-align: right; font-family: monospace;">
          ${total}
        </td>
      </tr>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1B19;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F5F0; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #FFFFFF; border: 1px solid #E7E0D2; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 30px; background-color: #1C1B19; color: #FFFFFF;">
              <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #C9A669; text-transform: uppercase;">
                ATELIER ORDER ALERT &bull; ADMIN NOTIFICATION
              </div>
              <h1 style="margin: 6px 0 0; font-size: 20px; font-weight: 700; color: #FFFFFF;">
                New Frame Order Received (#${order.id})
              </h1>
            </td>
          </tr>

          <!-- Customer Summary -->
          <tr>
            <td style="padding: 24px 30px 12px;">
              <h2 style="margin: 0 0 12px; font-size: 15px; color: #8C6D32; text-transform: uppercase; letter-spacing: 1px;">
                Customer &amp; Contact Details
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; border: 1px solid #EFEAE3; border-radius: 8px; padding: 14px 16px;">
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px; width: 120px;">Customer Name:</td>
                  <td style="font-size: 13px; font-weight: bold; color: #1C1B19; padding-bottom: 6px;">${order.customerName}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Phone:</td>
                  <td style="font-size: 13px; font-family: monospace; font-weight: bold; color: #1C1B19; padding-bottom: 6px;">
                    <a href="tel:${order.phone}" style="color: #1C1B19; text-decoration: none;">${order.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">WhatsApp:</td>
                  <td style="font-size: 13px; font-family: monospace; color: #1C1B19; padding-bottom: 6px;">
                    <a href="https://wa.me/${(order.whatsapp || order.phone).replace(/[^0-9]/g, "")}" style="color: #2E7D32; text-decoration: none; font-weight: bold;">
                      ${order.whatsapp || order.phone} (Open Chat)
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Email:</td>
                  <td style="font-size: 13px; color: #1C1B19; padding-bottom: 6px;">
                    <a href="mailto:${order.email}" style="color: #8C6D32; text-decoration: none;">${order.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Fulfillment Type:</td>
                  <td style="font-size: 13px; font-weight: bold; color: #1C1B19; padding-bottom: 6px;">${order.deliveryType || "Home Delivery"}</td>
                </tr>
                ${order.address ? `
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Delivery Address:</td>
                  <td style="font-size: 13px; color: #1C1B19; padding-bottom: 6px; line-height: 1.4;">${order.address}</td>
                </tr>` : ""}
                ${order.notes ? `
                <tr>
                  <td style="font-size: 12px; color: #7A746B; padding-bottom: 6px;">Instructions / Notes:</td>
                  <td style="font-size: 12px; color: #555555; padding-bottom: 6px; font-style: italic;">${order.notes}</td>
                </tr>` : ""}
                <tr>
                  <td style="font-size: 13px; font-weight: bold; color: #1C1B19; padding-top: 8px; border-top: 1px dashed #DDD6CA;">Order Grand Total:</td>
                  <td style="font-size: 16px; font-weight: bold; color: #1C1B19; font-family: monospace; padding-top: 8px; border-top: 1px dashed #DDD6CA;">${formattedTotal}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ordered Items Table -->
          <tr>
            <td style="padding: 12px 30px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 15px; color: #8C6D32; text-transform: uppercase; letter-spacing: 1px;">
                Items to Craft (${items.length} Frame${items.length > 1 ? "s" : ""})
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #EFEAE3; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #FAF8F5;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #7A746B; border-bottom: 1px solid #EFEAE3;">Frame Description</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #7A746B; border-bottom: 1px solid #EFEAE3;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #7A746B; border-bottom: 1px solid #EFEAE3;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Attached Bill Notice -->
          <tr>
            <td style="padding: 0 30px 24px;">
              <div style="background-color: #FAF8F5; border: 1px solid #EFEAE3; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #4A463F;">
                📎 <strong>Complete Bill PDF Attached:</strong> <em>SUBASH_STUDIO_Bill_${order.id}.pdf</em> with official itemization, pricing, and studio layout has been generated and attached.
              </div>
            </td>
          </tr>

          <!-- Admin Portal Quick Link -->
          <tr>
            <td style="padding: 0 30px 28px; text-align: center;">
              <a href="http://localhost:5173/admin/frames" style="display: inline-block; padding: 10px 24px; background-color: #1C1B19; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                Open Frames Manager in Admin Portal &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; text-align: center; background-color: #FAF8F5; border-top: 1px solid #EFEAE3; font-size: 11px; color: #7A746B;">
              SUBASH STUDIO Automated Notification System &bull; Direct Admin Dispatch
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const itemsText = items
    .map((item, idx) => {
      const wood = item.wood?.name || item.woodType || "Premium Timber";
      const design = item.design?.name || item.frameDesign || "Classic Finish";
      const ratio = item.ratio?.name || item.frameRatio || "Standard Size";
      const orientation = (item.orientation || "portrait").toUpperCase();
      const qty = item.quantity || 1;
      const total = formatCurrency(item.totalAmount || item.unitPrice * qty);
      return `  ${idx + 1}. ${wood} (Profile: ${design}, Size: ${ratio}, Orientation: ${orientation}) - Qty: ${qty} - Total: ${total}`;
    })
    .join("\n");

  const text = `
SUBASH STUDIO — NEW CUSTOM FRAME ORDER RECEIVED
=====================================================
Order ID: #${order.id}
Order Date: ${formattedDate}
Grand Total: ${formattedTotal}

CUSTOMER DETAILS:
- Name: ${order.customerName}
- Phone: ${order.phone}
- WhatsApp: ${order.whatsapp || order.phone}
- Email: ${order.email}
- Fulfillment: ${order.deliveryType || "Home Delivery"}
${order.address ? `- Delivery Address: ${order.address}\n` : ""}${order.notes ? `- Notes: ${order.notes}\n` : ""}
ORDERED FRAMES:
${itemsText}

ATTACHMENT:
The customer invoice PDF has been attached:
SUBASH_STUDIO_Bill_${order.id}.pdf
=====================================================
`;

  return { subject, html, text };
}
