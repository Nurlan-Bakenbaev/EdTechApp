"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { t, useLanguage } from "@/app/providers";

export function SiteFooter() {
  const { language } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand footer-brand"><span className="brand-mark"><Icon name="sparkle" size={18} /></span><span>BILIM</span></div>
          <p>{t(language, "Учимся думать, объяснять и пробовать снова.", "Ойлонуп, түшүндүрүп жана кайра аракет кылып үйрөнөбүз.")}</p>
        </div>
        <div className="footer-links">
          <Link href="/grades">{t(language, "Программы", "Программалар")}</Link>
          <Link href="/sources">{t(language, "Происхождение данных", "Маалыматтын булагы")}</Link>
          <Link href="/dashboard">{t(language, "Детский кабинет", "Балдар кабинети")}</Link>
          <Link href="/privacy">{t(language, "Обработка данных", "Маалыматтарды иштетүү")}</Link>
        </div>
        <p className="footer-note">
          {t(language, "Локальный учебный прототип. Кыргызские переводы требуют редакторской и методической проверки.", "Жергиликтүү окуу прототиби. Кыргызча котормолор редактордук жана методикалык текшерүүнү талап кылат.")}
        </p>
      </div>
    </footer>
  );
}
