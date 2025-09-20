type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

const buildUrlWithParams = (
  url: string,
  params?: RequestOptions["params"],
): string => {
  if (!params) return url;
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );
  if (Object.keys(filteredParams).length === 0) return url;
  const queryString = new URLSearchParams(
    filteredParams as Record<string, string>,
  ).toString();
  return `${url}?${queryString}`;
};

const fetchApi = async <T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> => {
  const {
    method = "GET",
    headers = {},
    body,
    params,
    cache = "no-store",
    next,
  } = options;

  const fullUrl = buildUrlWithParams(url, params);

  const response = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    cache,
    next,
  });

  if (!response.ok) {
    const fallback: { message?: string } = {};
    const json = (await response.json().catch(() => fallback)) as {
      message?: string;
    };
    const message = json.message || response.statusText;
    throw new Error(message);
  }

  return response.json();
};

export const api = {
  get: <T>(url: string, options?: RequestOptions): Promise<T> =>
    fetchApi<T>(url, { ...options, method: "GET" }),
  post: <T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> => fetchApi<T>(url, { ...options, method: "POST", body }),
  put: <T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    fetchApi<T>(url, { ...options, method: "PUT", body }),
  patch: <T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> => fetchApi<T>(url, { ...options, method: "PATCH", body }),
  delete: <T>(url: string, options?: RequestOptions): Promise<T> =>
    fetchApi<T>(url, { ...options, method: "DELETE" }),
};
