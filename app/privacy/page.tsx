import type { Metadata } from "next";
import { PrivacyPage } from "@/components/privacy-page";

export const metadata: Metadata = {
  title: "Обработка данных и конфиденциальность — BILIM",
  description: "Черновик уведомления BILIM об обработке данных и конфиденциальности.",
};

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
