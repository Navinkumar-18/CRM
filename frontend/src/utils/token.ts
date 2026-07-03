let memoryToken: string | null = null;

export const getAccessToken = (): string | null => {
  return memoryToken;
};

export const setAccessToken = (token: string | null): void => {
  memoryToken = token;
};
