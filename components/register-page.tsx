"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { t, useLanguage } from "@/app/providers";
import { mascots, type MascotId } from "@/lib/mascots";

type FormState = "idle" | "submitting" | "success" | "error";
type ErrorCode = "invalid_request" | "password_mismatch" | "weak_password" | "registration_unavailable" | "rate_limited" | "registration_failed";

const errorCodes = new Set<ErrorCode>([
  "invalid_request",
  "password_mismatch",
  "weak_password",
  "registration_unavailable",
  "rate_limited",
  "registration_failed",
]);

function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && errorCodes.has(value as ErrorCode);
}

export function RegisterPage() {
  const { language } = useLanguage();
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorCode, setErrorCode] = useState<ErrorCode>("registration_unavailable");
  const [password, setPassword] = useState("");
  const [selectedMascot, setSelectedMascot] = useState<MascotId | null>(null);
  const passwordIsStrong = [...password].length >= 12
    && /\p{Lu}/u.test(password)
    && /\p{N}/u.test(password)
    && /[^\p{L}\p{N}\s]/u.test(password);

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formState === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
    if (password !== passwordConfirm) {
      setErrorCode("password_mismatch");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.get("displayName"),
          email: formData.get("email"),
          mascotId: selectedMascot ?? "",
          password,
          consent: formData.get("consent") === "on",
        }),
      });
      const result: unknown = await response.json();
      const code = result && typeof result === "object" && "code" in result ? result.code : null;

      if (response.status === 202 && code === "confirmation_required") {
        setFormState("success");
        form.reset();
        setSelectedMascot(null);
        return;
      }

      setErrorCode(isErrorCode(code) ? code : "registration_unavailable");
      setFormState("error");
    } catch {
      setErrorCode("registration_unavailable");
      setFormState("error");
    }
  }

  const errorMessage = {
    invalid_request: t(language, "Проверьте адрес почты, пароль и согласие на обработку данных.", "Электрондук почтаны, сырсөздү жана маалыматтарды иштетүүгө макулдукту текшериңиз."),
    password_mismatch: t(language, "Введённые пароли не совпадают.", "Киргизилген сырсөздөр дал келген жок."),
    weak_password: t(language, "Пароль должен содержать не менее 12 символов, заглавную букву, цифру и специальный символ.", "Сырсөз кеминде 12 белгиден туруп, баш тамганы, санды жана атайын белгини камтышы керек."),
    registration_unavailable: t(language, "Сервис регистрации пока не настроен или временно недоступен. Попробуйте позже.", "Каттоо кызматы азырынча жөндөлө элек же убактылуу жеткиликсиз. Кийинчерээк аракет кылыңыз."),
    rate_limited: t(language, "Слишком много попыток. Подождите немного и попробуйте снова.", "Аракеттер өтө көп. Бир аз күтүп, кайра аракет кылыңыз."),
    registration_failed: t(language, "Не удалось создать аккаунт. Проверьте введённые данные и попробуйте снова.", "Аккаунт түзүлгөн жок. Киргизилген маалыматтарды текшерип, кайра аракет кылыңыз."),
  }[errorCode];

  return (
    <div className="page-surface register-surface">
      <div className="shell register-shell">
        <section className="register-card" aria-labelledby="register-title">
          <span className="eyebrow compact"><span className="eyebrow-dot" />{t(language, "Аккаунт родителя", "Ата-эненин аккаунту")}</span>
          <h1 id="register-title">{t(language, "Создайте аккаунт BILIM", "BILIM аккаунтун түзүңүз")}</h1>
          <p className="register-intro">{t(language, "Аккаунт создаёт родитель. Настоящее имя и данные о детях не нужны.", "Аккаунтту ата-эне түзөт. Чыныгы ысым жана балдар тууралуу маалымат керек эмес.")}</p>

          {formState === "success" ? (
            <div className="register-message register-success" role="status">
              <Icon name="check" size={22} />
              <div>
                <strong>{t(language, "Проверьте электронную почту", "Электрондук почтаңызды текшериңиз")}</strong>
                <p>{t(language, "Если адрес можно зарегистрировать, на него отправлено письмо подтверждения. Перейдите по ссылке в письме, чтобы продолжить.", "Эгер бул дарек менен катталса болсо, ага ырастоо каты жөнөтүлдү. Улантуу үчүн каттагы шилтемени ачыңыз.")}</p>
              </div>
            </div>
          ) : (
            <form className="register-form" onSubmit={submitRegistration}>
              <label className="register-field">
                <span>{t(language, "Имя пользователя или никнейм — необязательно", "Колдонуучу аты же никнейм — милдеттүү эмес")}</span>
                <input autoComplete="nickname" maxLength={80} name="displayName" placeholder={t(language, "Например: Звёздный кот или MathFox", "Мисалы: Жылдыздуу мышык же MathFox")} />
                <small>{t(language, "Можно написать ник или любимого персонажа. Настоящее имя указывать не нужно.", "Никнейм же сүйүктүү каарманыңызды жазыңыз. Чыныгы ысымды көрсөтүүнүн кереги жок.")}</small>
              </label>
              <section className="mascot-picker" aria-labelledby="mascot-picker-title">
                <div className="mascot-picker-heading">
                  <div>
                    <h2 id="mascot-picker-title">{t(language, "Выбери своего аватара", "Аватарыңды танда")}</h2>
                    <p>{t(language, "Кого возьмём с собой в уроки? Выбор можно не делать.", "Сабактарга кимди алабыз? Тандабай койсоң да болот.")}</p>
                  </div>
                  {selectedMascot && (
                    <button className="mascot-clear" onClick={() => setSelectedMascot(null)} type="button">
                      {t(language, "Не выбирать", "Тандабоо")}
                    </button>
                  )}
                </div>
                <div className="mascot-grid" role="radiogroup" aria-labelledby="mascot-picker-title">
                  {mascots.map((mascot) => (
                    <label
                      className={`mascot-option${selectedMascot === mascot.id ? " selected" : ""}`}
                      key={mascot.id}
                    >
                      <input
                        checked={selectedMascot === mascot.id}
                        className="mascot-radio"
                        name="mascotId"
                        onChange={() => setSelectedMascot(mascot.id)}
                        type="radio"
                        value={mascot.id}
                      />
                      <Image alt="" height={76} src={mascot.image} width={76} />
                      <span className="mascot-name">{mascot.name[language]}</span>
                      <span className="mascot-talent">{mascot.talent[language]}</span>
                    </label>
                  ))}
                </div>
              </section>
              <label className="register-field">
                <span>{t(language, "Электронная почта", "Электрондук почта")}</span>
                <input autoComplete="email" maxLength={254} name="email" required type="email" />
              </label>
              <label className="register-field">
                <span>{t(language, "Пароль (не менее 12 символов)", "Сырсөз (кеминде 12 белги)")}</span>
                <input
                  aria-describedby="register-password-hint"
                  autoComplete="new-password"
                  maxLength={72}
                  minLength={12}
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                />
                <small id="register-password-hint" className={passwordIsStrong ? "password-hint valid" : "password-hint"}>
                  {passwordIsStrong
                    ? t(language, "Пароль соответствует требованиям. Не используйте его для других сайтов.", "Сырсөз талаптарга жооп берет. Аны башка сайттарда колдонбоңуз.")
                    : t(language, "Придумайте уникальный пароль: минимум 12 символов, заглавная буква, цифра и специальный символ.", "Уникалдуу сырсөз түзүңүз: кеминде 12 белги, баш тамга, сан жана атайын белги.")}
                </small>
              </label>
              <label className="register-field">
                <span>{t(language, "Повторите пароль", "Сырсөздү кайталаңыз")}</span>
                <input autoComplete="new-password" maxLength={72} minLength={12} name="passwordConfirm" required type="password" />
              </label>
              <div className="register-consent">
                <input id="register-consent" name="consent" required type="checkbox" />
                <div>
                  <label htmlFor="register-consent">{t(language, "Я — родитель или законный представитель и даю согласие на обработку электронной почты, пароля, выбранного зверька и, если указан, никнейма для создания аккаунта и подтверждения адреса через Supabase Auth.", "Мен ата-эне же мыйзамдуу өкүл катары Supabase Auth аркылуу аккаунт түзүү жана даректи ырастоо үчүн электрондук почтамды, сырсөзүмдү, тандалган жаныбарды жана көрсөтүлсө никнеймимди иштетүүгө макулдук берем.")}</label>
                  <p className="register-policy-link">
                    {t(language, "Перед согласием прочитайте ", "Макулдук берүүдөн мурда ")}
                    <Link href="/privacy">{t(language, "уведомление об обработке данных", "маалыматтарды иштетүү билдирүүсүн")}</Link>
                    </p>
                </div>
              </div>
              {formState === "error" && <p className="register-message register-error" role="alert">{errorMessage}</p>}
              <button className="button button-primary register-submit" disabled={formState === "submitting"} type="submit">
                {formState === "submitting"
                  ? t(language, "Создаём аккаунт…", "Аккаунт түзүлүүдө…")
                  : t(language, "Создать аккаунт", "Аккаунт түзүү")}
              </button>
            </form>
          )}

          <div className="register-privacy">
            <Icon name="shield" size={19} />
            <p>{t(language, "Пароль обрабатывается сервисом аутентификации и не сохраняется в BILIM. Для публичного запуска обязательно включите HTTPS. Не вводите имена, даты рождения и другие личные данные детей.", "Сырсөз аутентификация кызматы тарабынан иштетилип, BILIMде сакталбайт. Коомдук ишке киргизүүдө HTTPS сөзсүз күйгүзүлүшү керек. Балдардын аттарын, туулган күндөрүн жана башка жеке маалыматтарын киргизбеңиз.")}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
