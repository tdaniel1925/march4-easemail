export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en", { weekday: "short" });
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export const avatarColors = [
  { bg: "rgb(253 235 235)", text: "rgb(83 5 5)" },
  { bg: "rgb(209 250 229)", text: "rgb(4 120 87)" },
  { bg: "rgb(253 237 237)", text: "rgb(56 2 2)" },
  { bg: "rgb(240 240 240)", text: "rgb(58 58 58)" },
];

export function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}
