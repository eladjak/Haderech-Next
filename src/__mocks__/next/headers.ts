export function cookies() {
  return {
    get: jest.fn().mockReturnValue({ value: "mock-cookie-value" }),
    getAll: jest.fn().mockReturnValue([]),
    set: jest.fn(),
    delete: jest.fn(),
  };
}
