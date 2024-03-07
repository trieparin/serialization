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
    const res = await fetch(`/api${url}`, options);
    if (!res.ok) throw new Error();
    return res.json();
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

  async function del<T>(url: string): Promise<T> {
    return request<T>(url, 'DELETE');
  }

  return {
    get,
    post,
    put,
    patch,
    del,
  };
}
