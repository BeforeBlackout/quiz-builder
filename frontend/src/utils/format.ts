export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function pluralize(count: number, noun: string) {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
