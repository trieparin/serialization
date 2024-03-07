export const RegExPassword = () => {
  return /^(?!.*\s)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
};

export const ValidatePassword = (password: string) => {
  const regex = RegExPassword();
  return regex.test(password);
};
