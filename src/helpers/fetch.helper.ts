export default function customFetch() {
  async function request<T>(
    url: string,
    method: string,
    body?: object
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const options: RequestInit = {
      method,
      headers,
      body: JSON.stringify(body),
    };
    const res = await fetch(url, options);
    return res.ok && res.json();
  }

  async function get<T>(url: string): Promise<T> {
    return request<T>(url, 'GET');
  }

  async function post<T>(url: string, body: object): Promise<T> {
    return request<T>(url, 'POST', body);
  }

  async function put<T>(url: string, body: object): Promise<T> {
    return request<T>(url, 'PUT', body);
  }

  async function patch<T>(url: string, body: object): Promise<T> {
    return request<T>(url, 'PATCH', body);
  }

  return {
    get,
    post,
    put,
    patch,
  };
}
