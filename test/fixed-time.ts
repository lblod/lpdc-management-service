export function setFixedTime(): Date {
  jest.useFakeTimers();
  const now = new Date();
  jest.spyOn(global, "Date").mockImplementation(() => now);
  return now;
}

export function restoreRealTime() {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
}
