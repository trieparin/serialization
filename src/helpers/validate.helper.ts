export const ValidatePassword = (password: string) => {
  return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/.test(password);
};

export const ValidateCookie = (name: string) => {
  const cookie: any = {};
  document.cookie.split(';').map((item) => {
    const [key, value] = item.split('=');
    cookie[key.trim()] = value.trim();
  });
  return cookie[name];
};
