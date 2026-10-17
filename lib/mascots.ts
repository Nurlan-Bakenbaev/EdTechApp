export const mascots = [
  {
    id: "fox",
    name: { ru: "Лисёнок", ky: "Түлкүчөк" },
    talent: { ru: "Быстро складывает в уме", ky: "Эсепти бат кошот" },
    image: "/assets/mascots/fox.svg",
  },
  {
    id: "bear",
    name: { ru: "Медвежонок", ky: "Аюуча" },
    talent: { ru: "Считает до 100 и обратно", ky: "100гө чейин жана артка санайт" },
    image: "/assets/mascots/bear.svg",
  },
  {
    id: "rabbit",
    name: { ru: "Зайчонок", ky: "Коёнчук" },
    talent: { ru: "Находит закономерности", ky: "Мыйзамченемдүүлүктү табат" },
    image: "/assets/mascots/rabbit.svg",
  },
  {
    id: "owl",
    name: { ru: "Совёнок", ky: "Үкү балапан" },
    talent: { ru: "Замечает хитрые подсказки", ky: "Кызыктуу белгилерди байкайт" },
    image: "/assets/mascots/owl.svg",
  },
  {
    id: "cat",
    name: { ru: "Котёнок", ky: "Мышыкча" },
    talent: { ru: "Сравнивает числа на раз-два", ky: "Сандарды оңой салыштырат" },
    image: "/assets/mascots/cat.svg",
  },
  {
    id: "hedgehog",
    name: { ru: "Ёжик", ky: "Кирпи" },
    talent: { ru: "Находит ошибки и проверяет ответ", ky: "Каталарды таап, жоопту текшерет" },
    image: "/assets/mascots/hedgehog.svg",
  },
] as const;

export type MascotId = (typeof mascots)[number]["id"];

const mascotIds = new Set<string>(mascots.map((mascot) => mascot.id));

export function isMascotId(value: unknown): value is MascotId {
  return typeof value === "string" && mascotIds.has(value);
}
