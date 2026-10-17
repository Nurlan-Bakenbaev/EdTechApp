"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/icon";
import type { Language } from "@/app/providers";

type Message = {
  role: "user" | "assistant";
  content: string;
  fallback?: boolean;
};

type TutorChatProps = {
  grade: number;
  topic: string;
  objective: string;
  language: Language;
};

const MAX_MESSAGE_LENGTH = 500;

export function TutorChat({ grade, topic, objective, language }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const isKyrgyz = language === "ky";

  async function askTutor(text: string) {
    const cleanText = text.trim();
    if (!cleanText || pending) return;

    const history = messages.slice(-8);
    setMessages((current) => [...current, { role: "user", content: cleanText }]);
    setQuestion("");
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanText,
          messages: history,
          grade,
          topic,
          objective,
          language,
        }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : isKyrgyz
              ? "Жооп алуу мүмкүн болгон жок. Кайра аракет кыл."
              : "Не получилось получить ответ. Попробуй ещё раз.";
        throw new Error(message);
      }

      const answer =
        typeof result === "object" && result !== null && "answer" in result
          ? result.answer
          : null;
      if (typeof answer !== "string" || !answer.trim()) {
        throw new Error(isKyrgyz ? "Жооп туура эмес форматта келди." : "Получен ответ в неверном формате.");
      }

      const usedFallback =
        typeof result === "object" &&
        result !== null &&
        "fallback" in result &&
        result.fallback === true;
      setMessages((current) => [
        ...current,
        { role: "assistant", content: answer.trim(), fallback: usedFallback },
      ]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : isKyrgyz
            ? "Байланыш катасы. Кайра аракет кыл."
            : "Ошибка соединения. Попробуй ещё раз.",
      );
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askTutor(question);
  }

  return (
    <section className="tutor-chat" aria-label={isKyrgyz ? "AI жардамчы Жылдыз" : "ИИ-помощник Жылдыз"}>
      <div className="tutor-chat-heading">
        <span className="tutor-chat-icon"><Icon name="sparkle" size={19} /></span>
        <div>
          <h3>{isKyrgyz ? "AI жардамчы Жылдыз" : "ИИ-помощник Жылдыз"}</h3>
          <p>{isKyrgyz ? "Жылдыздан сура" : "Спроси у Жылдыз"}</p>
        </div>
      </div>

      <div className="tutor-chat-messages" aria-live="polite" aria-relevant="additions">
        {messages.length === 0 && (
          <div className="tutor-chat-welcome">
            {isKyrgyz
              ? "Тема боюнча түшүндүрүп же кичинекей ишара бере алам."
              : "Объясню тему или дам небольшую подсказку."}
          </div>
        )}
        {messages.map((message, index) => (
          <div className={`tutor-message-wrap ${message.role}`} key={`${index}-${message.role}`}>
            {message.fallback && (
              <span className="tutor-fallback-label">
                {isKyrgyz ? "Жергиликтүү жардамчы" : "Локальный помощник"}
              </span>
            )}
            <p className={`tutor-message ${message.role}`}>{message.content}</p>
          </div>
        ))}
        {pending && <p className="tutor-message assistant tutor-typing">{isKyrgyz ? "Ойлонуп жатам…" : "Думаю…"}</p>}
      </div>

      {messages.length === 0 && (
        <div className="tutor-suggestions">
          <button onClick={() => void askTutor(isKyrgyz ? "Теманы жөнөкөй түшүндүр." : "Объясни тему проще.")} type="button">
            {isKyrgyz ? "Түшүндүр" : "Объясни тему"}
          </button>
          <button onClick={() => void askTutor(isKyrgyz ? "Жөнөкөй мисал көрсөт." : "Покажи простой пример.")} type="button">
            {isKyrgyz ? "Мисал келтир" : "Дай пример"}
          </button>
        </div>
      )}

      {error && <p className="tutor-chat-error" role="alert">{error}</p>}

      <form className="tutor-chat-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="tutor-question">
          {isKyrgyz ? "Сурооңду жаз" : "Напиши свой вопрос"}
        </label>
        <input
          autoComplete="off"
          disabled={pending}
          id="tutor-question"
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={isKyrgyz ? "Сурооңду жаз…" : "Напиши вопрос…"}
          value={question}
        />
        <button aria-label={isKyrgyz ? "Жөнөтүү" : "Отправить"} disabled={!question.trim() || pending} type="submit">
          <Icon name="arrow" size={19} />
        </button>
      </form>
      <p className="tutor-chat-note">
        {isKyrgyz ? "Жеке маалыматтарды жазба." : "Не пиши личные данные."}
      </p>
    </section>
  );
}
