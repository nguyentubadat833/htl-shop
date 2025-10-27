function authSession() {
  const key = "authSession";

  function set(data: UserAuthClient) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  function get(): UserAuthClient | null {
    try {
      const data = sessionStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as UserAuthClient;
    } catch (e) {
      return null;
    }
  }

  function remove() {
    sessionStorage.removeItem(key);
  }

  return { set, get, remove };
}

export default () => {
  return { authSession };
};
