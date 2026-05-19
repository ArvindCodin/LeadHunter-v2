import type { Business } from "./types";

function csvCell(value: string | number | boolean): string {
  return '"' + String(value ?? "").replace(/"/g, '""') + '"';
}

function normalizePhone(raw: string): string {
  if (!raw) return "";
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  digits = digits.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.length > 10 && digits.startsWith("0"))
    digits = digits.replace(/^0+/, "");
  return digits;
}

/**
 * Converts a list of businesses to a CSV string and triggers a browser download.
 */
export function exportToCsv(leads: Business[], filename = "leadhunter-export.csv"): void {
  const headers = [
    "Name",
    "Category",
    "Area",
    "Rating",
    "Reviews",
    "Has Website",
    "Phone",
    "WhatsApp Number",
    "WhatsApp Link",
    "Address",
  ];

  const rows = leads.map((b) => {
    const waNum = normalizePhone(b.phone);
    const waLink = waNum ? `https://wa.me/${waNum}` : "";
    return [
      csvCell(b.name),
      csvCell(b.category),
      csvCell(b.area),
      csvCell(b.rating),
      csvCell(b.reviews),
      csvCell(b.hasWebsite ? "Yes" : "No"),
      csvCell(b.phone),
      csvCell(waNum),
      csvCell(waLink),
      csvCell(b.address),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Formats a phone number into a WhatsApp URL.
 */
export function whatsappLink(phone: string): string {
  const digits = normalizePhone(phone);
  return digits ? `https://wa.me/${digits}` : "";
}
