export const getValidImageUrl = (url: string | null | undefined): string => {
  const DEFAULT_IMG = "/imgNotfound.png";
  if (!url || url == "???") return DEFAULT_IMG;
  return url;
};
