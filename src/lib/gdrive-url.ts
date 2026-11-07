const gdrivePattern =
  /^https?:\/\/(drive\.google\.com\/(file\/d\/|drive\/folders\/|drive\/u\/\d+\/folders\/|open\?id=)|docs\.google\.com\/(document\/d\/|spreadsheets\/d\/|presentation\/d\/|forms\/d\/))[a-zA-Z0-9_-]+/i;

export function isValidGoogleDriveUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  return gdrivePattern.test(url.trim());
}
