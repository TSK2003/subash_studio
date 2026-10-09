import PDFDocument from "pdfkit";

/**
 * Format currency in Indian numbering format (e.g., Rs. 1,500)
 */
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString("en-IN")}`;
}

/**
 * Format date to "DD MMMM YYYY", e.g. "09 October 2026"
 */
function formatDate(dateInput) {
  if (!dateInput) {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Generates an official, publication-grade PDF bill for a custom frame order.
 * @param {Object} order - The persisted FrameOrder object.
 * @param {Object} studioInfo - Studio details (name, phone, email, addresses, etc.)
 * @returns {Promise<Buffer>} - Resolves with the generated PDF Buffer.
 */
export async function generateFrameBillPdf(order, studioInfo = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `SUBASH STUDIO - Frame Order Bill #${order.id}`,
          Author: "SUBASH STUDIO",
          Subject: `Custom Frame Order Bill for ${order.customerName}`,
          Keywords: "Subash Studio, Frame Order, Bill, Invoice, Woodcraft",
          CreationDate: new Date(),
        },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const primaryColor = "#1C1B19"; // Charcoal black
      const goldColor = "#8C6D32"; // Warm luxury bronze gold
      const mutedColor = "#666666"; // Supporting gray
      const borderColor = "#D6CFC7"; // Subtle separator line
      const cardBg = "#FAF8F5"; // Light cream background
      const pageWidth = 515; // 595 - 2*40 margins

      // ==========================================================
      // 1. BRAND HEADER
      // ==========================================================
      let y = 40;

      // Studio Sub-heading
      doc
        .fontSize(8.5)
        .font("Helvetica-Bold")
        .fillColor(goldColor)
        .text("ATELIER WOODCRAFT & CUSTOM FRAMING", 40, y, {
          align: "center",
          characterSpacing: 2,
        });

      y += 14;

      // Studio Title
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("SUBASH STUDIO", 40, y, {
          align: "center",
          characterSpacing: 3,
        });

      y += 26;

      // Tagline
      doc
        .fontSize(8.5)
        .font("Helvetica-Oblique")
        .fillColor(mutedColor)
        .text("Fine Photography & Cinematic Films  •  Est. 1993", 40, y, {
          align: "center",
        });

      y += 16;

      // Bill Title Badge
      const badgeText = "OFFICIAL CUSTOM FRAME ORDER BILL";
      const badgeWidth = 240;
      const badgeX = (595 - badgeWidth) / 2;
      doc
        .rect(badgeX, y, badgeWidth, 18)
        .lineWidth(0.75)
        .strokeColor(goldColor)
        .fillColor(cardBg)
        .fillAndStroke();

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(badgeText, badgeX, y + 4.5, {
          width: badgeWidth,
          align: "center",
          characterSpacing: 1.5,
        });

      y += 28;

      // Dividing Hairline
      doc
        .moveTo(40, y)
        .lineTo(40 + pageWidth, y)
        .lineWidth(0.5)
        .strokeColor(borderColor)
        .stroke();

      y += 12;

      // ==========================================================
      // 2. METADATA: BILL TO & ORDER INFORMATION (2 COLUMNS)
      // ==========================================================
      const colWidth = pageWidth / 2 - 10;
      const leftColX = 40;
      const rightColX = 40 + colWidth + 20;
      const metaStartY = y;

      // Left Column Header: CUSTOMER INFORMATION
      doc
        .fontSize(8.5)
        .font("Helvetica-Bold")
        .fillColor(goldColor)
        .text("BILL TO (CUSTOMER DETAILS)", leftColX, y);

      let leftY = y + 14;

      const customerRows = [
        { label: "Customer Name:", val: order.customerName || "N/A" },
        { label: "Phone Number:", val: order.phone || "N/A" },
        { label: "WhatsApp:", val: order.whatsapp || order.phone || "N/A" },
        { label: "Email Address:", val: order.email || "N/A" },
        { label: "Fulfillment:", val: order.deliveryType || "Home Delivery" },
      ];

      if (order.address) {
        customerRows.push({ label: "Delivery Address:", val: order.address });
      }
      if (order.notes) {
        customerRows.push({ label: "Instructions:", val: order.notes });
      }

      customerRows.forEach((row) => {
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor(mutedColor)
          .text(row.label, leftColX, leftY, { width: 85, continued: false });

        doc
          .fontSize(8)
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text(row.val, leftColX + 85, leftY, { width: colWidth - 85 });

        const rowHeight = Math.max(12, doc.heightOfString(row.val, { width: colWidth - 85 }) + 3);
        leftY += rowHeight;
      });

      // Right Column Header: ORDER & PAYMENT DETAILS
      doc
        .fontSize(8.5)
        .font("Helvetica-Bold")
        .fillColor(goldColor)
        .text("ORDER & PAYMENT SUMMARY", rightColX, metaStartY);

      let rightY = metaStartY + 14;

      const paymentStatusText =
        order.paymentStatus ||
        (order.status === "DELIVERED"
          ? "PAID"
          : order.deliveryType === "Studio Pickup"
          ? "PAY AT STUDIO (PENDING)"
          : "CASH ON DELIVERY (PENDING)");

      const orderRows = [
        { label: "Order ID:", val: `#${order.id}` },
        { label: "Order Date:", val: formatDate(order.createdAt) },
        { label: "Order Status:", val: (order.status || "NEW").toUpperCase() },
        { label: "Payment Status:", val: paymentStatusText },
        { label: "Total Units:", val: String(order.quantity || 1) },
      ];

      orderRows.forEach((row) => {
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor(mutedColor)
          .text(row.label, rightColX, rightY, { width: 85, continued: false });

        doc
          .fontSize(8)
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text(row.val, rightColX + 85, rightY, { width: colWidth - 85 });

        rightY += 14;
      });

      y = Math.max(leftY, rightY) + 12;

      // Dividing Hairline
      doc
        .moveTo(40, y)
        .lineTo(40 + pageWidth, y)
        .lineWidth(0.5)
        .strokeColor(borderColor)
        .stroke();

      y += 12;

      // ==========================================================
      // 3. ITEMIZATION TABLE
      // ==========================================================
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("ITEMIZED FRAME SPECIFICATIONS", 40, y);

      y += 14;

      // Table Header Row
      const colX_item = 40;
      const colW_item = 25;

      const colX_desc = 65;
      const colW_desc = 245;

      const colX_dim = 310;
      const colW_dim = 70;

      const colX_qty = 380;
      const colW_qty = 30;

      const colX_unit = 410;
      const colW_unit = 55;

      const colX_total = 465;
      const colW_total = 90;

      // Header background
      doc
        .rect(40, y, pageWidth, 18)
        .fillColor(cardBg)
        .fill();

      doc
        .rect(40, y, pageWidth, 18)
        .lineWidth(0.5)
        .strokeColor(borderColor)
        .stroke();

      doc.fontSize(7.5).font("Helvetica-Bold").fillColor(goldColor);
      doc.text("#", colX_item, y + 4.5, { width: colW_item, align: "center" });
      doc.text("FRAME CRAFT SPECIFICATION", colX_desc + 4, y + 4.5, { width: colW_desc - 4 });
      doc.text("ORIENTATION", colX_dim, y + 4.5, { width: colW_dim, align: "center" });
      doc.text("QTY", colX_qty, y + 4.5, { width: colW_qty, align: "center" });
      doc.text("UNIT", colX_unit, y + 4.5, { width: colW_unit, align: "right" });
      doc.text("TOTAL", colX_total, y + 4.5, { width: colW_total - 5, align: "right" });

      y += 18;

      // Determine items list (handles both multi-item array and single-item fields)
      const rawItems = Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : Array.isArray(order.orderItems) && order.orderItems.length > 0
        ? order.orderItems
        : [
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

      rawItems.forEach((item, index) => {
        const itemY = y;
        const woodName = item.wood?.name || item.woodType || "Premium Timber";
        const designName = item.design?.name || item.frameDesign || "Classic Finish";
        const ratioName = item.ratio?.name || item.frameRatio || "Standard Size";
        const orientation = (item.orientation || "portrait").toUpperCase();
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.unitPrice) || 0;
        const lineTotal = Number(item.totalAmount) || unitPrice * qty;

        // Content
        doc.fontSize(8).font("Helvetica-Bold").fillColor(primaryColor);
        doc.text(String(index + 1), colX_item, itemY + 5, { width: colW_item, align: "center" });

        // Title line
        doc.text(`${woodName}  •  ${designName}`, colX_desc + 4, itemY + 5, { width: colW_desc - 4 });

        // Subtitle line (breakdown)
        doc.fontSize(7).font("Helvetica").fillColor(mutedColor);
        doc.text(
          `Timber Wood: ${woodName} | Profile Design: ${designName} | Size: ${ratioName}`,
          colX_desc + 4,
          itemY + 17,
          { width: colW_desc - 4 }
        );

        doc.fontSize(7.5).font("Helvetica").fillColor(primaryColor);
        doc.text(orientation, colX_dim, itemY + 7, { width: colW_dim, align: "center" });
        doc.text(String(qty), colX_qty, itemY + 7, { width: colW_qty, align: "center" });
        doc.text(formatCurrency(unitPrice), colX_unit, itemY + 7, { width: colW_unit, align: "right" });

        doc.font("Helvetica-Bold");
        doc.text(formatCurrency(lineTotal), colX_total, itemY + 7, { width: colW_total - 5, align: "right" });

        const rowHeight = 30;

        // Row bottom border
        doc
          .moveTo(40, itemY + rowHeight)
          .lineTo(40 + pageWidth, itemY + rowHeight)
          .lineWidth(0.4)
          .strokeColor(borderColor)
          .stroke();

        y += rowHeight;
      });

      // ==========================================================
      // 4. TOTAL SUMMARY BLOCK
      // ==========================================================
      y += 8;

      const summaryW = 200;
      const summaryX = 40 + pageWidth - summaryW;

      // Background card for total
      doc
        .rect(summaryX, y, summaryW, 36)
        .fillColor(cardBg)
        .fill();

      doc
        .rect(summaryX, y, summaryW, 36)
        .lineWidth(0.75)
        .strokeColor(goldColor)
        .stroke();

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(mutedColor)
        .text("TOTAL UNITS ORDERED:", summaryX + 10, y + 6);

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(
          String(rawItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0)),
          summaryX + 130,
          y + 6,
          { width: 60, align: "right" }
        );

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("GRAND TOTAL:", summaryX + 10, y + 19);

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(formatCurrency(order.totalAmount), summaryX + 100, y + 18, {
          width: 90,
          align: "right",
        });

      y += 46;

      // ==========================================================
      // 5. ATELIER NOTES & POLICIES
      // ==========================================================
      doc
        .rect(40, y, pageWidth, 42)
        .fillColor("#FDFDFD")
        .fill();

      doc
        .rect(40, y, pageWidth, 42)
        .lineWidth(0.4)
        .strokeColor(borderColor)
        .stroke();

      doc
        .fontSize(7.5)
        .font("Helvetica-Bold")
        .fillColor(goldColor)
        .text("CRAFTSMANSHIP & ATELIER FULFILLMENT NOTICE", 50, y + 6);

      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor(mutedColor)
        .text(
          "Every Subash Studio frame is individually handcrafted using kiln-seasoned natural hardwoods and precision archival mounting. Orders undergo artisan joinery, fine finishing, and safe shock-proof packaging prior to dispatch.",
          50,
          y + 17,
          { width: pageWidth - 20, lineGap: 1.5 }
        );

      y += 50;

      // ==========================================================
      // 6. STUDIO CONTACT & LEGAL DISCLAIMER (FOOTER)
      // ==========================================================
      const footerY = 750; // Pin near bottom of A4 (842)

      doc
        .moveTo(40, footerY)
        .lineTo(40 + pageWidth, footerY)
        .lineWidth(0.5)
        .strokeColor(borderColor)
        .stroke();

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(
          studioInfo.studioName || "SUBASH STUDIO — Fine Photography & Atelier Framing",
          40,
          footerY + 8,
          { align: "center" }
        );

      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor(mutedColor)
        .text(
          "Tirunelveli Atelier  •  Kalladaikurichi Heritage Studio  •  Tenkasi Branch",
          40,
          footerY + 19,
          { align: "center" }
        );

      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor(mutedColor)
        .text(
          `Phone: ${studioInfo.phone || "+91 93457 06609"}  •  WhatsApp: ${
            studioInfo.whatsapp || "+91 93457 06609"
          }  •  Email: ${studioInfo.email || "subashstudio009@gmail.com"}`,
          40,
          footerY + 29,
          { align: "center" }
        );

      doc
        .fontSize(6.5)
        .font("Helvetica-Oblique")
        .fillColor("#999999")
        .text(
          "THIS IS AN OFFICIAL COMPUTER-GENERATED BILL FOR CUSTOM FRAMING SERVICES. NO PHYSICAL SIGNATURE IS REQUIRED.",
          40,
          footerY + 41,
          { align: "center", characterSpacing: 0.5 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export default generateFrameBillPdf;
