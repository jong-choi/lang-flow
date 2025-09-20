import componentGenerator from "./generators/component/index.mjs";

export default function generator(plop) {
  plop.setGenerator("component", componentGenerator);
}
