export interface ChatModelOption {
  value: string;
  label: string;
}

export const DEFAULT_CHAT_MODEL = "gemma-3-27b-it" as const;

export const CHAT_MODELS: ChatModelOption[] = [
  {
    value: "gemma-3-27b-it",
    label: "Gemma 3 27B",
  },
  {
    value: "gemma-3-4b-it",
    label: "Gemma 3 4B",
  },
];

export const CHAT_MODEL_VALUES = CHAT_MODELS.map((model) => model.value);
