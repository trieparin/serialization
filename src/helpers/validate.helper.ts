export const ValidatePassword = (password: string) => {
  const regex = /^(?!.*\s)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
  return regex.test(password);
};
