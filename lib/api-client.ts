async function handleResponse(response: Response): Promise<unknown> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    return response.blob();
  }
  return response.json();
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });
}

export async function apiPost(path: string, body: unknown): Promise<unknown> {
  const response = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function apiGet(path: string): Promise<unknown> {
  const response = await apiFetch(path, { method: 'GET', cache: 'no-store' });
  return handleResponse(response);
}

export async function apiDelete(path: string): Promise<unknown> {
  const response = await apiFetch(path, { method: 'DELETE' });
  return handleResponse(response);
}

export async function apiPostForm(path: string, formData: FormData): Promise<unknown> {
  const response = await fetch(path, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  return handleResponse(response);
}
