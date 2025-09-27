
FROM node:20-alpine AS base

RUN apk add --no-cache ca-certificates

# 1단계 : 빌드
FROM base AS builder

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# 설치 및 의존성 설치
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
  fi

# 나머지 앱 코드 복사
COPY . .

# 빌드/런타임에 주입할 새 환경 변수들
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG NEXT_PUBLIC_AMPLITUDE_API_KEY
ENV NEXT_PUBLIC_AMPLITUDE_API_KEY=${NEXT_PUBLIC_AMPLITUDE_API_KEY}
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ARG AUTH_SECRET
ENV AUTH_SECRET=${AUTH_SECRET}
ARG AUTH_GOOGLE_ID
ENV AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID}
ARG AUTH_GOOGLE_SECRET
ENV AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET}
ARG GOOGLE_SEARCH_API_KEY
ENV GOOGLE_SEARCH_API_KEY=${GOOGLE_SEARCH_API_KEY}
ARG GOOGLE_SEARCH_CX
ENV GOOGLE_SEARCH_CX=${GOOGLE_SEARCH_CX}
ARG GOOGLE_AI_API_KEY
ENV GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}

RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else npm run build; \
  fi

# 2단계: 프로덕션 이미지 실행
FROM base AS runner

WORKDIR /app

# 추출 전까지는 root 유지 - 추출 후에 사용자를 next js 로
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 모드에서 실행하고 public과 static 파일을 이미지로 복사.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 빌드 시 캐시된 모델 복사
# 런타임에 주입할 새 환경 변수들
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG NEXT_PUBLIC_AMPLITUDE_API_KEY
ENV NEXT_PUBLIC_AMPLITUDE_API_KEY=${NEXT_PUBLIC_AMPLITUDE_API_KEY}
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ARG AUTH_SECRET
ENV AUTH_SECRET=${AUTH_SECRET}
ARG AUTH_GOOGLE_ID
ENV AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID}
ARG AUTH_GOOGLE_SECRET
ENV AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET}
ARG GOOGLE_SEARCH_API_KEY
ENV GOOGLE_SEARCH_API_KEY=${GOOGLE_SEARCH_API_KEY}
ARG GOOGLE_SEARCH_CX
ENV GOOGLE_SEARCH_CX=${GOOGLE_SEARCH_CX}
ARG GOOGLE_AI_API_KEY
ENV GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}

USER nextjs
CMD ["node", "server.js"]
