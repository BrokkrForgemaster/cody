export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function absoluteUrl(path = "") {
  const baseUrl = "https://bluegrass-custom-demo.vercel.app";
  return `${baseUrl}${path}`;
}
