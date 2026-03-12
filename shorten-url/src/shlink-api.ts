import { getPreferenceValues } from "@raycast/api";

export interface ShlinkShortUrl {
  shortCode: string;
  shortUrl: string;
  longUrl: string;
  dateCreated: string;
  visitsSummary: { total: number };
  tags: string[];
  title: string | null;
}

interface ShlinkListResponse {
  shortUrls: {
    data: ShlinkShortUrl[];
    pagination: {
      currentPage: number;
      pagesCount: number;
      totalItems: number;
    };
  };
}

interface ShlinkError {
  detail?: string;
  title?: string;
  status?: number;
}

function getConfig() {
  const { shlinkUrl, shlinkApiKey } = getPreferenceValues<ExtensionPreferences>();
  return {
    baseUrl: shlinkUrl.replace(/\/+$/, ""),
    apiKey: shlinkApiKey,
  };
}

async function shlinkFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { baseUrl, apiKey } = getConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let detail = `API error (${response.status})`;
    try {
      const err = (await response.json()) as ShlinkError;
      detail = err.detail || err.title || detail;
    } catch {
      // not JSON
    }
    throw new Error(detail);
  }

  // DELETE returns 204 No Content
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function listShortUrls(): Promise<ShlinkShortUrl[]> {
  const data = await shlinkFetch<ShlinkListResponse>(
    "/rest/v3/short-urls?page=1&itemsPerPage=200&orderBy=dateCreated-DESC"
  );
  return data.shortUrls.data;
}

export async function createShortUrl(longUrl: string, customSlug?: string): Promise<ShlinkShortUrl> {
  return shlinkFetch<ShlinkShortUrl>("/rest/v3/short-urls", {
    method: "POST",
    body: JSON.stringify({
      longUrl,
      ...(customSlug ? { customSlug } : {}),
      findIfExists: true,
    }),
  });
}

export async function editShortUrl(shortCode: string, longUrl: string): Promise<ShlinkShortUrl> {
  return shlinkFetch<ShlinkShortUrl>(`/rest/v3/short-urls/${shortCode}`, {
    method: "PATCH",
    body: JSON.stringify({ longUrl }),
  });
}

export async function deleteShortUrl(shortCode: string): Promise<void> {
  await shlinkFetch<void>(`/rest/v3/short-urls/${shortCode}`, {
    method: "DELETE",
  });
}
