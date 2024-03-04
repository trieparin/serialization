export const ValidatePassword = (password: string) => {
  return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/.test(password);
};
