"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { t, useLanguage } from "@/app/providers";

const links = [
  { href: "/dashboard", ru: "Кабинет", ky: "Жеке кабинет" },
  { href: "/grades", ru: "Классы", ky: "Класстар" },
  { href: "/sources", ru: "Источники", ky: "Булактар" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="BILIM — главная">
          <span className="brand-mark"><Icon name="sparkle" size={21} /></span>
          <span>BILIM</span>
        </Link>
        <nav className="desktop-nav" aria-label={t(language, "Главная навигация", "Негизги навигация")}>
          {links.map((link) => (
            <Link className={pathname.startsWith(link.href) ? "nav-link active" : "nav-link"} href={link.href} key={link.href}>
              {t(language, link.ru, link.ky)}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="language-switch" onClick={toggleLanguage} type="button" aria-label={t(language, "Переключить на кыргызский", "Орус тилине которуу")}>
            <span className={language === "ru" ? "selected" : ""}>RU</span>
            <span className={language === "ky" ? "selected" : ""}>KY</span>
          </button>
          <Link className="header-register" href="/register">
            {t(language, "Регистрация", "Катталуу")}
          </Link>
          <Link className="profile-button" href="/dashboard" aria-label={t(language, "Открыть кабинет", "Жеке кабинетти ачуу")}>
            <Icon name="user" size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}
