
import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "sr" | "ru";

export const translations = {
  en: {
    customer: "Customer",
    provider: "Provider",
    admin: "Admin",
    dashboard: "Dashboard",
    postTask: "Post Task",
    myTasks: "My Tasks",
    offers: "Offers",
    messages: "Messages",
    profile: "Profile",
    settings: "Settings",
    taskFeed: "Task Feed",
    myOffers: "My Offers",
    acceptedTasks: "Accepted Tasks",
    earnings: "Earnings",
    userManager: "User Manager",
    taskOversight: "Task Oversight",
    disputes: "Disputes",
    reports: "Reports",
    broadcasts: "Broadcasts",
    categoryManager: "Category Manager",
    selectRole: "Select your role",
    appName: "Task Hub",
    language: "Language",
    home: "Home",
    chat: "Chat",
    favorites: "Favorites",
    referral: "Referral",
    review: "Review"
  },
  sr: {
    customer: "Korisnik",
    provider: "Pružalac usluga",
    admin: "Admin",
    dashboard: "Kontrolna tabla",
    postTask: "Postavi zadatak",
    myTasks: "Moji zadaci",
    offers: "Ponude",
    messages: "Poruke",
    profile: "Profil",
    settings: "Podešavanja",
    taskFeed: "Lista zadataka",
    myOffers: "Moje ponude",
    acceptedTasks: "Prihvaćeni zadaci",
    earnings: "Zarada",
    userManager: "Korisnici",
    taskOversight: "Nadzor zadatka",
    disputes: "Sporovi",
    reports: "Izveštaji",
    broadcasts: "Obaveštenja",
    categoryManager: "Kategorije",
    selectRole: "Izaberite svoju ulogu",
    appName: "Task Hub",
    language: "Jezik",
    home: "Početna",
    chat: "Razgovor",
    favorites: "Omiljeni",
    referral: "Preporuke",
    review: "Recenzija"
  },
  ru: {
    customer: "Клиент",
    provider: "Исполнитель",
    admin: "Админ",
    dashboard: "Панель управления",
    postTask: "Создать задание",
    myTasks: "Мои задания",
    offers: "Предложения",
    messages: "Сообщения",
    profile: "Профиль",
    settings: "Настройки",
    taskFeed: "Лента заданий",
    myOffers: "Мои предложения",
    acceptedTasks: "Принятые задания",
    earnings: "Доход",
    userManager: "Пользователи",
    taskOversight: "Мониторинг заданий",
    disputes: "Споры",
    reports: "Отчёты",
    broadcasts: "Объявления",
    categoryManager: "Категории",
    selectRole: "Выберите вашу роль",
    appName: "Task Hub",
    language: "Язык",
    home: "Главная",
    chat: "Чат",
    favorites: "Избранное",
    referral: "Реферальная",
    review: "Отзыв"
  }
};

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations["en"]) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be within I18nProvider");
  return ctx;
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const t = (key: keyof typeof translations["en"]) => translations[lang][key] || key;
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}
