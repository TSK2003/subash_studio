import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Format date string to "DD MMMM YYYY", e.g. "09 October 2026"
 */
function formatReceiptDate(dateInput) {
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
 * Format frame ratio/size label cleanly (e.g. "5 × 7" or "18 × 12")
 */
function formatRatioLabel(ratioName) {
  if (!ratioName) return "Standard Size";
  let clean = String(ratioName).replace(/inches/gi, "").trim();
  clean = clean.replace(/\s*[xX×]\s*/g, " × ");
  return clean;
}

/**
 * Formats a numeric currency value into Indian Rupee format, e.g. "₹2,500"
 */
function formatRupee(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
}

/**
 * Generates an official, publication-grade PDF receipt for a custom frame order,
 * matching the SUBASH STUDIO public receipt design and reference layout.
 *
 * @param {Object} order - The persisted FrameOrder database object.
 * @param {Object} [studioInfo={}] - Authoritative studio contact & metadata.
 * @returns {Promise<Buffer>} - Resolves with the generated PDF Buffer.
 */
export async function generateFrameBillPdf(order, studioInfo = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4", // 595.28 x 841.89 points
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
        info: {
          Title: `SUBASH STUDIO - Frame Order Receipt #${order.id}`,
          Author: "SUBASH STUDIO",
          Subject: `Custom Frame Order Receipt for ${order.customerName}`,
          Keywords: "Subash Studio, Frame Order Receipt, Atelier Woodcraft",
          CreationDate: new Date(),
        },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // -------------------------------------------------------------
      // Font Registration & Fallbacks
      // -------------------------------------------------------------
      const notoFontPath = path.resolve(__dirname, "../assets/fonts/NotoSansTamil.ttf");
      const hasNoto = fs.existsSync(notoFontPath);
      if (hasNoto) {
        doc.registerFont("Noto", notoFontPath);
      }

      const fontRegular = hasNoto ? "Noto" : "Helvetica";
      const fontBold = hasNoto ? "Noto" : "Helvetica-Bold";
      const fontSerif = "Times-Roman";
      const fontSerifBold = "Times-Bold";
      const fontSerifItalic = "Times-Italic";

      // -------------------------------------------------------------
      // Color Palette (matching reference image & FramePrintReceipt)
      // -------------------------------------------------------------
      const colPrimary = "#1C1B19"; // Rich charcoal black
      const colGold = "#8C6D32"; // Atelier bronze gold
      const colMuted = "#6B7280"; // Supporting neutral gray
      const colLight = "#9CA3AF"; // Disclaimer light gray
      const colBorder = "#CBD5E1"; // Card border line
      const colDivider = "#E5E7EB"; // Inner section hairline
      const colCardBg = "#FAF8F5"; // Item card warm background

      // -------------------------------------------------------------
      // Layout Geometry (Compact centered A4 receipt card)
      // -------------------------------------------------------------
      const cardWidth = 450;
      const cardX = (595.28 - cardWidth) / 2; // ~72.64 pt
      const cardY = 40;
      const padX = 22;
      const contentX = cardX + padX;
      const contentWidth = cardWidth - padX * 2; // 406 pt

      let y = cardY + 20;

      // 1. Studio Logo
      const logoPath = path.resolve(__dirname, "../assets/images/logo.png");
      if (fs.existsSync(logoPath)) {
        const logoWidth = 34;
        const logoX = cardX + (cardWidth - logoWidth) / 2;
        doc.image(logoPath, logoX, y, { width: logoWidth });
        y += 34 + 6;
      } else {
        y += 4;
      }

      // 2. ATELIER WOODCRAFT & FRAMING
      doc
        .font(fontBold)
        .fontSize(7.5)
        .fillColor(colGold)
        .text("ATELIER WOODCRAFT & FRAMING", contentX, y, {
          width: contentWidth,
          align: "center",
          characterSpacing: 1.5,
        });
      y += 12;

      // 3. SUBASH STUDIO
      doc
        .font(fontSerifBold)
        .fontSize(21)
        .fillColor(colPrimary)
        .text("SUBASH STUDIO", contentX, y, {
          width: contentWidth,
          align: "center",
          characterSpacing: 2,
        });
      y += 24;

      // 4. Fine Photography & Cinematic Films
      doc
        .font(fontSerifItalic)
        .fontSize(8.5)
        .fillColor(colMuted)
        .text("Fine Photography & Cinematic Films", contentX, y, {
          width: contentWidth,
          align: "center",
        });
      y += 14;

      // 5. FRAME ORDER RECEIPT badge
      const badgeW = 136;
      const badgeH = 16;
      const badgeX = cardX + (cardWidth - badgeW) / 2;
      doc
        .rect(badgeX, y, badgeW, badgeH)
        .lineWidth(0.75)
        .strokeColor("#D1D5DB")
        .fillColor(colCardBg)
        .fillAndStroke();

      doc
        .font(fontBold)
        .fontSize(7.5)
        .fillColor(colPrimary)
        .text("FRAME ORDER RECEIPT", badgeX, y + 4.5, {
          width: badgeW,
          align: "center",
          characterSpacing: 1.5,
        });
      y += badgeH + 12;

      // Horizontal Divider
      doc
        .moveTo(contentX, y)
        .lineTo(contentX + contentWidth, y)
        .lineWidth(0.75)
        .strokeColor(colDivider)
        .stroke();
      y += 10;

      // -------------------------------------------------------------
      // 6. ORDER INFO (3 Columns in one row)
      // -------------------------------------------------------------
      const colW1 = 140;
      const colW2 = 140;
      const colW3 = contentWidth - colW1 - colW2;

      // Col 1: ORDER ID
      doc
        .font(fontBold)
        .fontSize(6.5)
        .fillColor(colMuted)
        .text("ORDER ID", contentX, y, { characterSpacing: 0.5 });
      doc
        .font(fontBold)
        .fontSize(9)
        .fillColor(colPrimary)
        .text(order.id, contentX, y + 9);

      // Col 2: ORDER DATE
      doc
        .font(fontBold)
        .fontSize(6.5)
        .fillColor(colMuted)
        .text("ORDER DATE", contentX + colW1, y, { characterSpacing: 0.5 });
      doc
        .font(fontRegular)
        .fontSize(8)
        .fillColor(colPrimary)
        .text(formatReceiptDate(order.createdAt), contentX + colW1, y + 9);

      // Col 3: STATUS (Right aligned)
      doc
        .font(fontBold)
        .fontSize(6.5)
        .fillColor(colMuted)
        .text("STATUS", contentX + colW1 + colW2, y, {
          width: colW3,
          align: "right",
          characterSpacing: 0.5,
        });
      doc
        .font(fontBold)
        .fontSize(8.5)
        .fillColor(colPrimary)
        .text(order.status || "NEW", contentX + colW1 + colW2, y + 9, {
          width: colW3,
          align: "right",
        });

      y += 24;

      // Horizontal Divider
      doc
        .moveTo(contentX, y)
        .lineTo(contentX + contentWidth, y)
        .lineWidth(0.75)
        .strokeColor(colDivider)
        .stroke();
      y += 9;

      // -------------------------------------------------------------
      // 7. CUSTOMER DETAILS (2 Columns Key-Value)
      // -------------------------------------------------------------
      doc
        .font(fontBold)
        .fontSize(7.5)
        .fillColor(colPrimary)
        .text("CUSTOMER DETAILS", contentX, y, { characterSpacing: 0.5 });
      y += 11;

      const custColW = contentWidth / 2 - 8;
      const custLeftX = contentX;
      const custRightX = contentX + custColW + 16;

      const drawField = (x, currY, label, val, isBold = false) => {
        doc.font(fontRegular).fontSize(7.5).fillColor(colMuted).text(label, x, currY, { continued: true });
        doc.font(isBold ? fontBold : fontRegular).fontSize(7.5).fillColor(colPrimary).text(val || "—");
      };

      // Row 1: Name & Phone
      drawField(custLeftX, y, "Name: ", order.customerName, true);
      drawField(custRightX, y, "Phone: ", order.phone);
      y += 12;

      // Row 2: WhatsApp & Email
      drawField(custLeftX, y, "WhatsApp: ", order.whatsapp || order.phone);
      drawField(custRightX, y, "Email: ", order.email);
      y += 12;

      // Row 3: Fulfillment
      drawField(custLeftX, y, "Fulfillment: ", order.deliveryType || "Studio Pickup", true);
      y += 12;

      // Row 4: Delivery Address (if present)
      if (order.address && order.address.trim()) {
        doc.font(fontRegular).fontSize(7.5).fillColor(colMuted).text("Delivery Address: ", custLeftX, y, { continued: true });
        doc.font(fontRegular).fontSize(7.5).fillColor(colPrimary).text(order.address.trim(), {
          width: contentWidth - 75,
        });
        y += doc.heightOfString(order.address.trim(), { width: contentWidth - 75, fontSize: 7.5 }) + 4;
      }

      // Row 5: Notes / Instructions (if present)
      if (order.notes && order.notes.trim()) {
        doc.font(fontSerifItalic).fontSize(7).fillColor(colMuted).text("Instructions: ", custLeftX, y, { continued: true });
        doc.font(fontSerifItalic).fontSize(7).fillColor("#4B5563").text(order.notes.trim(), {
          width: contentWidth - 65,
        });
        y += doc.heightOfString(order.notes.trim(), { width: contentWidth - 65, fontSize: 7 }) + 4;
      }

      y += 4;

      // Horizontal Divider
      doc
        .moveTo(contentX, y)
        .lineTo(contentX + contentWidth, y)
        .lineWidth(0.75)
        .strokeColor(colDivider)
        .stroke();
      y += 9;

      // -------------------------------------------------------------
      // 8. ORDERED FRAMES & ITEM CARDS
      // -------------------------------------------------------------
      const items = (order.items && order.items.length > 0)
        ? order.items
        : [
            {
              woodType: order.woodType || "Custom Wood",
              frameDesign: order.frameDesign || "Classic Profile",
              frameRatio: order.frameRatio || "Standard Size",
              orientation: order.orientation || "portrait",
              quantity: order.quantity || 1,
              unitPrice: order.unitPrice || order.totalAmount,
              totalAmount: order.totalAmount,
            },
          ];

      const totalUnits = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
      const itemsHeading = `ORDERED FRAMES (${items.length} ITEM${items.length > 1 ? "S" : ""})`;

      doc
        .font(fontBold)
        .fontSize(7.5)
        .fillColor(colPrimary)
        .text(itemsHeading, contentX, y, { characterSpacing: 0.5 });

      doc
        .font(fontRegular)
        .fontSize(7)
        .fillColor(colMuted)
        .text(`Total Units: ${totalUnits}`, contentX, y, {
          width: contentWidth,
          align: "right",
        });

      y += 12;

      // Render individual frame cards
      items.forEach((item, idx) => {
        const itemBoxY = y;
        const itemBoxH = 46;
        const woodName = item.wood?.name || item.woodType || "Timber Frame";
        const designName = item.design?.name || item.frameDesign || "Classic";
        const ratioName = formatRatioLabel(item.ratio?.name || item.frameRatio);
        const orientation = item.orientation || "portrait";
        const qty = item.quantity || 1;
        const unitPrice = item.unitPrice || (item.totalAmount / qty);
        const itemTotal = item.totalAmount || (unitPrice * qty);

        // Frame card container
        doc
          .roundedRect(contentX, itemBoxY, contentWidth, itemBoxH, 2)
          .lineWidth(0.5)
          .strokeColor("#E5E7EB")
          .fillColor(colCardBg)
          .fillAndStroke();

        // Line 1: Frame Title & Total
        doc
          .font(fontBold)
          .fontSize(8.5)
          .fillColor(colPrimary)
          .text(`Frame #${idx + 1}: ${woodName}`, contentX + 8, itemBoxY + 6);

        doc
          .font(fontBold)
          .fontSize(8.5)
          .fillColor(colPrimary)
          .text(formatRupee(itemTotal), contentX, itemBoxY + 6, {
            width: contentWidth - 8,
            align: "right",
          });

        // Line 2: Profile & Size
        const line2Y = itemBoxY + 18;
        doc
          .font(fontRegular)
          .fontSize(7)
          .fillColor(colMuted)
          .text("Profile: ", contentX + 8, line2Y, { continued: true });
        doc
          .font(fontBold)
          .fontSize(7)
          .fillColor(colPrimary)
          .text(designName, { continued: true });
        doc
          .font(fontRegular)
          .fontSize(7)
          .fillColor(colMuted)
          .text("  •  Size: ", { continued: true });
        doc
          .font(fontBold)
          .fontSize(7)
          .fillColor(colPrimary)
          .text(ratioName, { continued: true });
        doc
          .font(fontRegular)
          .fontSize(7)
          .fillColor(colMuted)
          .text(` (${orientation})`);

        // Micro internal divider
        doc
          .moveTo(contentX + 8, itemBoxY + 31)
          .lineTo(contentX + contentWidth - 8, itemBoxY + 31)
          .lineWidth(0.4)
          .strokeColor("#E5E7EB")
          .stroke();

        // Line 3: Unit Price & Qty
        const line3Y = itemBoxY + 33;
        doc
          .font(fontRegular)
          .fontSize(6.5)
          .fillColor(colMuted)
          .text(`Unit: ${formatRupee(unitPrice)} × Qty ${qty}`, contentX + 8, line3Y);

        doc
          .font(fontRegular)
          .fontSize(7)
          .fillColor(colMuted)
          .text(formatRupee(itemTotal), contentX, line3Y, {
            width: contentWidth - 8,
            align: "right",
          });

        y += itemBoxH + 6;
      });

      // Divider above GRAND TOTAL
      y += 2;
      doc
        .moveTo(contentX, y)
        .lineTo(contentX + contentWidth, y)
        .lineWidth(0.75)
        .strokeColor("#D1D5DB")
        .stroke();
      y += 7;

      // GRAND TOTAL ROW
      doc
        .font(fontBold)
        .fontSize(8.5)
        .fillColor(colPrimary)
        .text("GRAND TOTAL", contentX, y + 2, { characterSpacing: 0.5 });

      doc
        .font(fontBold)
        .fontSize(11)
        .fillColor(colPrimary)
        .text(formatRupee(order.totalAmount), contentX, y, {
          width: contentWidth,
          align: "right",
        });

      y += 18;

      // -------------------------------------------------------------
      // 9. BOTTOM THANK YOU & STATUS
      // -------------------------------------------------------------
      y += 6;
      {
        const label = "Order Status: ";
        const val = order.status || "NEW";
        doc.font(fontRegular).fontSize(7.5);
        const lW = doc.widthOfString(label);
        doc.font(fontBold).fontSize(7.5);
        const vW = doc.widthOfString(val);
        const totalW = lW + vW;
        const startX = contentX + (contentWidth - totalW) / 2;
        doc.font(fontRegular).fontSize(7.5).fillColor(colMuted).text(label, startX, y, { lineBreak: false });
        doc.font(fontBold).fontSize(7.5).fillColor(colPrimary).text(val, startX + lW, y);
      }
      y += 12;

      {
        const p1 = "Thank you for choosing ";
        const p2 = "SUBASH STUDIO.";
        doc.font(fontSerif).fontSize(8.5);
        const p1W = doc.widthOfString(p1);
        doc.font(fontSerifBold).fontSize(8.5);
        const p2W = doc.widthOfString(p2);
        const totalW = p1W + p2W;
        const startX = contentX + (contentWidth - totalW) / 2;
        doc.font(fontSerif).fontSize(8.5).fillColor(colPrimary).text(p1, startX, y, { lineBreak: false });
        doc.font(fontSerifBold).fontSize(8.5).fillColor(colPrimary).text(p2, startX + p1W, y);
      }
      y += 12;

      doc
        .font(fontSerifItalic)
        .fontSize(7.5)
        .fillColor(colGold)
        .text("A fine photography and cinematography house.", contentX, y, {
          width: contentWidth,
          align: "center",
        });
      y += 14;

      // -------------------------------------------------------------
      // 10. STUDIO CONTACT & DISCLAIMER
      // -------------------------------------------------------------
      doc
        .moveTo(contentX, y)
        .lineTo(contentX + contentWidth, y)
        .lineWidth(0.75)
        .strokeColor(colDivider)
        .stroke();
      y += 8;

      doc
        .font(fontRegular)
        .fontSize(7)
        .fillColor(colMuted)
        .text(
          "Tirunelveli Atelier • Kalladaikurichi Heritage Studio",
          contentX,
          y,
          { width: contentWidth, align: "center" }
        );
      y += 10;

      const studioPhone = studioInfo.phone || "+91 93457 06609";
      const studioEmail = studioInfo.email || "subashstudio002@gmail.com";
      doc
        .font(fontRegular)
        .fontSize(7)
        .fillColor(colMuted)
        .text(
          `Direct Inquiries: ${studioPhone} • ${studioEmail}`,
          contentX,
          y,
          { width: contentWidth, align: "center" }
        );
      y += 10;

      doc
        .font(fontBold)
        .fontSize(6)
        .fillColor(colLight)
        .text(
          "THIS IS AN OFFICIAL COMPUTER-GENERATED RECEIPT FOR CUSTOM FRAMING ORDER.",
          contentX,
          y,
          { width: contentWidth, align: "center", characterSpacing: 0.5 }
        );
      y += 16;

      // Outer receipt block card border
      const cardHeight = y - cardY;
      doc
        .rect(cardX, cardY, cardWidth, cardHeight)
        .lineWidth(0.75)
        .strokeColor(colBorder)
        .stroke();

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export default {
  generateFrameBillPdf,
};
