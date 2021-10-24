declare global {
  namespace jest {
    interface Matchers<R> {
      isRegistered(username: string): R;
      isLoggedIn(): R;
    }
  }
}

export {};
