const fs = require("fs");
const path = require("path");

function parseEnvFile(content) {
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  const root = process.cwd();
  const candidates = [".env", ".env.local"];

  for (const filename of candidates) {
    const filePath = path.join(root, filename);
    if (fs.existsSync(filePath)) {
      parseEnvFile(fs.readFileSync(filePath, "utf8"));
    }
  }
}

loadEnv();
