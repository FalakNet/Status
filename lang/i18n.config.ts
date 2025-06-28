import en from "./locales/en-US.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "en",
  messages: { en },
  fallbackLocale: "en",
  // 语言偏好
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: "i18n_redirected",
    alwaysRedirect: true,
    fallbackLocale: "en",
    redirectOn: "root",
  },
}));
