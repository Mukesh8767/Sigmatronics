export const encodeBase64 = (str: string): string => {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const decodeBase64 = (str: string): string => {
  try {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4 !== 0) str += "=";
    return atob(str);
  } catch (e) {
    console.error("Base64 decode failed:", str, e);
    return "";
  }
};
