import importPlugin from "eslint-plugin-import";
import storybook from "eslint-plugin-storybook";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const createFeatureIsolationRules = () => {
  const featuresPath = "./src/features";

  // 피처 디렉토리 목록 가져오기
  const features = fs
    .readdirSync(featuresPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // 각 피처별로 격리 규칙 생성
  return features.map((feature) => ({
    target: `./src/features/${feature}`,
    from: "./src/features",
    except: [`./${feature}`],
    message: `Feature '${feature}' cannot import from other features`,
  }));
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // app이 features를 import하는 것은 금지 (단방향 아키텍처)
            {
              target: "./src/features",
              from: "./src/app",
            },
            // shared에서 features/app을 import하는 것은 금지 (단방향 아키텍처)
            {
              target: [
                "./src/components",
                "./src/hooks",
                "./src/lib",
                "./src/types",
                "./src/utils",
              ],
              from: ["./src/features", "./src/app"],
            },
            // feature간 상호 import 금지
            ...createFeatureIsolationRules(),
          ],
        },
      ],
      // 임포트 타입 강제
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "import/no-duplicates": "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  ...storybook.configs["flat/recommended"],
];

export default eslintConfig;
