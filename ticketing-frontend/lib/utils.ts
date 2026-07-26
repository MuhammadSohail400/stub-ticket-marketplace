/**
 * Shared formatting and utility functions across the application.
 */

export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "Rs 0";
  }
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

export function formatEventDate(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    concert: "#14213D",
    sports: "#2F6B4F",
    conference: "#E8A33D",
    festival: "#C1443C",
    theatre: "#4A2E80",
  };
  return colors[category?.toLowerCase()] || "#14213D";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
