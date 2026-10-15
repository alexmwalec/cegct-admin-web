export function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-MW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Blantyre",
  }).format(date);
}
