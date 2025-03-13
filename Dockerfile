FROM node:23-bullseye AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# For better cache utilization, copy package.json and lock file first and install the dependencies before copying the
# rest of the application and building.
WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .

FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS production
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

CMD [ "pnpm", "start.prod" ]