export type MockAmplitude = {
  track: (eventType: string, eventProperties?: Record<string, unknown>) => void;
  addEventMiddleware: (
    middleware: (payload: unknown, next: (payload: unknown) => void) => void,
  ) => void;
};

const amplitude: MockAmplitude = {
  track: () => {},
  addEventMiddleware: () => {},
};

export default amplitude;
