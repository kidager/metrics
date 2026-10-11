# Base image
FROM node:24-bookworm-slim

# Puppeteer uses the system Chrome installed below
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_BROWSER_PATH=google-chrome-stable

# Install Chrome, fonts to support major charsets, deno for miscellaneous scripts,
# ruby for the github licensed gem and python for node-gyp
# Based on https://pptr.dev/troubleshooting#running-puppeteer-in-docker
RUN apt-get update \
  && apt-get install -y --no-install-recommends wget gnupg ca-certificates curl unzip \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
  && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 libx11-xcb1 libxtst6 lsb-release \
  && curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s -- --yes --no-modify-path \
  && apt-get install -y ruby-full git g++ make cmake pkg-config libssl-dev python3 xz-utils patch \
  && gem install licensed \
  && rm -rf /var/lib/apt/lists/*

# Install node modules first so they stay cached when only the sources change
WORKDIR /metrics
COPY package.json package-lock.json ./
RUN npm ci

# Copy repository and rebuild indexes
COPY . /metrics
RUN chmod +x /metrics/source/app/action/index.mjs \
  && npm run build

# Execute GitHub action
ENTRYPOINT ["node", "/metrics/source/app/action/index.mjs"]
