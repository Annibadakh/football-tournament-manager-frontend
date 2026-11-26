// Browser storage can be blocked (private mode, disabled site data); never let that crash the app
export const readStorage = (key, fallback = null) => {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preference simply isn't remembered on this device
  }
};
