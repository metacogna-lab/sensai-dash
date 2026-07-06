# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM oven/bun:1.3-alpine AS deps
WORKDIR /build

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: builder ─────────────────────────────────────────────────────────
FROM oven/bun:1.3-alpine AS builder
WORKDIR /build

COPY --from=deps /build/node_modules ./node_modules
COPY . .

# SENSAI_ROOT is not needed at build time; sandbox.ts uses process.cwd() at
# runtime. Set a placeholder so any accidental build-time resolution is safe.
ENV SENSAI_ROOT=/harness
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ── Stage 3: runner ──────────────────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Override in docker-compose or at `docker run` time.
ENV SENSAI_ROOT=/harness
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Only ship what Next.js standalone outputs + public + static assets.
# Public directory is optional (may not exist for minimal Next.js apps).
COPY --from=builder /build/.next/standalone ./
COPY --from=builder /build/.next/static ./.next/static

# /harness is the bind-mount target for the harness root (see docker-compose.yml).
# The app reads engagements/, operations/, etc. from there at runtime.
VOLUME ["/harness"]

EXPOSE 3000
CMD ["bun", "server.js"]
