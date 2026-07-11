export const REMEMBERED_LOGIN_EMAIL_COOKIE = "fc_admin_login_email";

export const rememberedEmailCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 365,
  path: "/login",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
