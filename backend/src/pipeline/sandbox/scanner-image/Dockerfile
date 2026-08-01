FROM python:3.12-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl unzip git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir bandit semgrep || pip install --no-cache-dir bandit

RUN curl -fsSL https://github.com/gitleaks/gitleaks/releases/download/v8.24.0/gitleaks_8.24.0_linux_x64.tar.gz \
    -o /tmp/gitleaks.tar.gz \
  && tar -xzf /tmp/gitleaks.tar.gz -C /usr/local/bin gitleaks \
  && chmod +x /usr/local/bin/gitleaks \
  || true
