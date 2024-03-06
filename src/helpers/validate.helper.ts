export const ValidatePassword = (password: string) => {
  const regex = /^(?!.*\s)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
  return regex.test(password);
};

export const ValidateCookie = (name: string) => {
  return document.cookie
    .split(';')
    .map((item) => {
      const [key, value] = item.split('=');
      return name === key.trim() && value;
    })
    .toString();
};
