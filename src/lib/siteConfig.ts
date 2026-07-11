const LOCAL_SITE_URL = "http://localhost:3000";

type DeploymentSource =
  | "site-url"
  | "vercel-production"
  | "vercel-preview"
  | "netlify-production"
  | "netlify-preview"
  | "render-production"
  | "local";

export interface SiteConfig {
  url: URL;
  origin: string;
  isIndexable: boolean;
  deploymentSource: DeploymentSource;
}

function parseSiteUrl(value: string | undefined): URL | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const withProtocol = /^https?:\/\//i.test(candidate)
      ? candidate
      : `https://${candidate}`;
    const parsed = new URL(withProtocol);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    parsed.pathname = "/";
    parsed.search = "";
    parsed.hash = "";
    return parsed;
  } catch {
    return null;
  }
}

function isPublicOrigin(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  return !(
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".example") ||
    hostname === "example.com" ||
    hostname.endsWith(".example.com")
  );
}

function isPreviewEnvironment(env: NodeJS.ProcessEnv): boolean {
  return (
    env.VERCEL_ENV === "preview" ||
    env.CONTEXT === "deploy-preview" ||
    env.CONTEXT === "branch-deploy"
  );
}

export function resolveSiteConfig(env: NodeJS.ProcessEnv = process.env): SiteConfig {
  const explicitSiteUrl = parseSiteUrl(env.SITE_URL);
  const preview = isPreviewEnvironment(env);
  const lighthouseAudit =
    env.LIGHTHOUSE_CI === "1" && env.NODE_ENV === "production";

  if (explicitSiteUrl) {
    return {
      url: explicitSiteUrl,
      origin: explicitSiteUrl.origin,
      isIndexable:
        (isPublicOrigin(explicitSiteUrl) || lighthouseAudit) && !preview,
      deploymentSource: "site-url",
    };
  }

  if (env.VERCEL_ENV === "production") {
    const productionUrl = parseSiteUrl(env.VERCEL_PROJECT_PRODUCTION_URL);
    if (productionUrl) {
      return {
        url: productionUrl,
        origin: productionUrl.origin,
        isIndexable: isPublicOrigin(productionUrl),
        deploymentSource: "vercel-production",
      };
    }
  }

  if (env.CONTEXT === "production") {
    const productionUrl = parseSiteUrl(env.URL);
    if (productionUrl) {
      return {
        url: productionUrl,
        origin: productionUrl.origin,
        isIndexable: isPublicOrigin(productionUrl),
        deploymentSource: "netlify-production",
      };
    }
  }

  if (env.NODE_ENV === "production") {
    const productionUrl = parseSiteUrl(env.RENDER_EXTERNAL_URL);
    if (productionUrl) {
      return {
        url: productionUrl,
        origin: productionUrl.origin,
        isIndexable: isPublicOrigin(productionUrl),
        deploymentSource: "render-production",
      };
    }
  }

  const previewUrl =
    parseSiteUrl(env.VERCEL_URL) ??
    (preview ? parseSiteUrl(env.DEPLOY_PRIME_URL) : null);
  if (previewUrl) {
    return {
      url: previewUrl,
      origin: previewUrl.origin,
      isIndexable: false,
      deploymentSource: env.VERCEL_URL ? "vercel-preview" : "netlify-preview",
    };
  }

  const localUrl = new URL(LOCAL_SITE_URL);
  return {
    url: localUrl,
    origin: localUrl.origin,
    isIndexable: false,
    deploymentSource: "local",
  };
}

export const siteConfig = resolveSiteConfig();

export function absoluteUrl(pathname = "/"): string {
  return new URL(pathname, siteConfig.url).toString();
}
