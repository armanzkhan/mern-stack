import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve to a single canonical path so Windows path casing (Frontend vs frontend) doesn't load React twice
function resolveReactPath(subpath) {
  const full = path.resolve(__dirname, "node_modules", subpath);
  try {
    const real = fs.realpathSync(full);
    // Normalize to lowercase on Windows so Frontend vs frontend always resolves to same string
    if (process.platform === "win32") {
      return real.toLowerCase();
    }
    return real;
  } catch {
    return full;
  }
}

const reactPath = resolveReactPath("react");
const reactDomPath = resolveReactPath("react-dom");

// Normalize alias paths on Windows so path.join doesn't reintroduce casing
function toCanonical(p) {
  return process.platform === "win32" ? p.toLowerCase() : p;
}

const reactAliases = {
  react: reactPath,
  "react-dom": reactDomPath,
  "react/jsx-runtime": toCanonical(path.join(reactPath, "jsx-runtime.js")),
  "react/jsx-dev-runtime": toCanonical(path.join(reactPath, "jsx-dev-runtime.js")),
  "react-dom/client": toCanonical(path.join(reactDomPath, "client.js")),
};

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Avoid Turbopack dev overlay bug (useSegmentState/useContext null in next-devtools)
  devIndicators: false,

  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.VERCEL ? 'https://mern-stack-dtgy.vercel.app' : 'http://167.172.196.0:5000'),
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.VERCEL ? 'https://mern-stack-dtgy.vercel.app' : 'http://167.172.196.0:5000'),
  },

  turbopack: {
    resolveAlias: reactAliases,
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      ...reactAliases,
    };
    return config;
  },
};

export default nextConfig;
