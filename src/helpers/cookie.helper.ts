export const SetCookie = (name: string, value: string, expire?: number) => {
  const date = new Date();
  if (expire) date.setTime(date.getTime() + expire);
  document.cookie = `${name}=${value}; path=/; expires=${date.toUTCString()};`;
};

export const GetCookie = (name: string) => {
  return document.cookie.split(';').find((item) => {
    const [key, value] = item.split('=');
    return name === key.trim() && value;
  });
};
