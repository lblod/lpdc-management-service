
export function setFixedTime() {
    jest.useFakeTimers();
    const now = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => now);
}

export function restoreRealTime() {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
}
