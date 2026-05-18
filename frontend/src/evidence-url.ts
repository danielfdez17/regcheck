const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i;

export function toAbsoluteEvidenceUrl(referenceUrl: string): string {
  const trimmedUrl = referenceUrl.trim();
  if (!trimmedUrl) {
    return "";
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl.replace(/^\/+/, "")}`;
}
