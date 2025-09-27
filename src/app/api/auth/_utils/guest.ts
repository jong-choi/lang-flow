import { randomInt } from "node:crypto";
import { generateSlug } from "random-word-slugs";

const BASE62_CHARS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const generateGuestPassword = () => {
  const length = randomInt(8, 17);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += BASE62_CHARS[randomInt(0, BASE62_CHARS.length)];
  }
  return password;
};

export const createGuestIdentity = () => {
  const slug = generateSlug(2, {
    partsOfSpeech: ["adjective", "noun"],
    categories: { noun: ["animals"] },
    format: "kebab",
  });

  const localPart = slug.replace(/-/g, ".");

  return {
    email: `guest@${localPart}`,
    displayName: slug
      .split("-")
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" "),
  } as const;
};
