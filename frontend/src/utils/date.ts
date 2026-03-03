type FirestoreTimestampLike = {
  toDate?: () => Date;
  toMillis?: () => number;
};

export function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === "object" && value !== null) {
    const ts = value as FirestoreTimestampLike;
    if (typeof ts.toDate === "function") {
      const date = ts.toDate();
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (typeof ts.toMillis === "function") {
      const date = new Date(ts.toMillis());
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateShort(value: unknown): string {
  const date = toDate(value);
  if (!date) return "-";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: unknown): string {
  const date = toDate(value);
  if (!date) return "-";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(value: unknown): string {
  const date = toDate(value);
  if (!date) return "Unknown";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(date);
}
