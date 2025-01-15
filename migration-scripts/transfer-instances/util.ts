export function buildFilename(
  infix: string,
  fromLabel: string,
  toLabel?: string,
): string {
  const timestamp = generateFilenamePrefix();
  const from = "from-" + normalizeLabel(fromLabel);
  const to = toLabel ? "-to-" + normalizeLabel(toLabel) : "";

  return `${timestamp}-${infix}-${from}${to}`;
}

function normalizeLabel(label: string) {
  return label.replaceAll(" ", "_").toLocaleLowerCase();
}

function generateFilenamePrefix(): string {
  const date = new Date();
  return `${date.getFullYear()}${addLeadingZero(date.getMonth() + 1)}${addLeadingZero(date.getDate())}${addLeadingZero(date.getHours())}${addLeadingZero(date.getMinutes())}${addLeadingZero(date.getSeconds())}`;
}

function addLeadingZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}
