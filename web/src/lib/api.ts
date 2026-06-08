export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { detail?: string }).detail || "خطا در ارتباط با سرور";
    throw new Error(typeof msg === "string" ? msg : "خطا");
  }
  return data as T;
}

export type Advert = {
  id: number;
  owner_name?: string;
  operation?: string;
  euro_amount?: number;
  rate_toman?: number;
  description?: string;
  methods?: string[] | string;
  account_country?: string;
  instant_transfer?: string;
  channel_link?: string | null;
  locked?: boolean;
  is_mine?: boolean;
};
