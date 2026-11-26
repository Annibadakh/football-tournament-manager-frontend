import { useEffect, useState } from "react";

// Seconds left until something is allowed again (e.g. resending an OTP)
const useCountdown = (initialSeconds = 0) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return { secondsLeft, restart: setSecondsLeft };
};

export default useCountdown;
