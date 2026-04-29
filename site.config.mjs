export const siteConfig = {
  title: "290 datenbanken",
  description: "290 datenbanken Kurs BBZ Biel Bienne",
  repoName: "290-datenbanken",
};

function normalizeBase(value) {
  if (!value || value === "/") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export const base = normalizeBase(
  process.env.VITEPRESS_BASE ??
    (siteConfig.repoName ? `/${siteConfig.repoName}/` : "/"),
);
