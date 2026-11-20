import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BusinessProfile, Quote } from "@/types/quote";
import { calculateQuoteTotals, formatMoney } from "./format";

export function downloadQuotePdf(quote: Quote, business: BusinessProfile) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const totals = calculateQuoteTotals(quote);

  // Header accent bar
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 612, 8, "F");

  let textX = 42;
  if (business.logoDataUrl) {
    try {
      const format = business.logoDataUrl.includes("image/png") ? "PNG" : "JPEG";
      doc.addImage(business.logoDataUrl, format, 42, 34, 46, 46);
      textX = 98;
    } catch {
      textX = 42;
    }
  }

  // Business Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(business.name, textX, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(business.tagline, textX, 68);
  doc.text(`${business.address}  •  ${business.phone}  •  ${business.email}`, textX, 82);

  // Quote Meta Box (Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(5, 150, 105);
  doc.text("COTIZACIÓN", 570, 50, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`N.º: ${quote.quoteNumber}`, 570, 66, { align: "right" });
  doc.text(`Fecha: ${quote.createdAt}`, 570, 80, { align: "right" });
  doc.text(`Válida hasta: ${quote.validUntil}`, 570, 94, { align: "right" });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(42, 110, 570, 110);

  // Client Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(42, 124, 528, 62, 6, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("PREPARADO PARA:", 56, 142);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  doc.text(quote.clientName || "Cliente", 56, 158);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const clientMeta = [quote.clientCompany, quote.clientPhone].filter(Boolean).join("  •  ");
  doc.text(clientMeta || "Contacto directo", 56, 174);

  // Summary
  if (quote.summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(quote.summary, 42, 208);
  }

  // Line Items Table
  autoTable(doc, {
    startY: quote.summary ? 220 : 204,
    margin: { left: 42, right: 42 },
    head: [["Servicio / Concepto", "Cant.", "Unidad", "Precio Unit.", "Total"]],
    body: quote.items.map((item) => [
      `${item.name}\n${item.description || ""}`.trim(),
      String(item.quantity),
      item.unit,
      formatMoney(item.unitPrice, quote.currency),
      formatMoney(item.quantity * item.unitPrice, quote.currency),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 235 },
      1: { halign: "center", cellWidth: 45 },
      2: { halign: "center", cellWidth: 60 },
      3: { halign: "right", cellWidth: 92 },
      4: { halign: "right", cellWidth: 96, fontStyle: "bold" },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 380;
  let y = finalY + 22;

  // Totals Box (Right)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", 430, y);
  doc.text(formatMoney(totals.subtotal, quote.currency), 570, y, { align: "right" });

  if (quote.discountPercent > 0) {
    y += 16;
    doc.text(`Descuento (${quote.discountPercent}%):`, 430, y);
    doc.text(`-${formatMoney(totals.discountAmount, quote.currency)}`, 570, y, { align: "right" });
  }

  if (quote.taxPercent > 0) {
    y += 16;
    doc.text(`${business.taxLabel || "IVA"} (${quote.taxPercent}%):`, 430, y);
    doc.text(formatMoney(totals.taxAmount, quote.currency), 570, y, { align: "right" });
  }

  y += 12;
  doc.setDrawColor(203, 213, 225);
  doc.line(425, y, 570, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105);
  doc.text("TOTAL:", 430, y);
  doc.text(formatMoney(totals.total, quote.currency), 570, y, { align: "right" });

  // Notes / Terms
  if (quote.notes) {
    const notesY = Math.max(finalY + 24, y + 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text("Condiciones y notas:", 42, notesY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const wrapped = doc.splitTextToSize(quote.notes, 520);
    doc.text(wrapped, 42, notesY + 14);
  }

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generado con Axioma-X • ${business.name}`, 306, 760, { align: "center" });

  doc.save(`${quote.quoteNumber}-${(quote.clientName || "cliente").replace(/\s+/g, "_")}.pdf`);
}
