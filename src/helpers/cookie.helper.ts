export const setCookie = (name: string, value: string, expire?: number) => {
  const date = new Date();
  if (expire) date.setTime(date.getTime() + expire);
  document.cookie = `${name}=${value}; path=/; expires=${date.toUTCString()};`;
};

export const getCookie = (name: string) => {
  return (
    typeof window !== 'undefined' &&
    document.cookie.split(';').find((item) => {
      const [key, value] = item.split('=');
      return name === key.trim() && value;
    })
  );
};
