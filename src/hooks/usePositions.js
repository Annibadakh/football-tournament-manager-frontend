import { useEffect, useState } from "react";
import { listPositions } from "@/services/position.service";

// Master positions rarely change: fetch once per page load
let cachedPositions = null;
let pendingRequest = null;

const usePositions = () => {
  const [positions, setPositions] = useState(cachedPositions ?? []);

  useEffect(() => {
    if (cachedPositions) return;
    pendingRequest ??= listPositions().then((res) => {
      if (res.ok) cachedPositions = res.data;
      pendingRequest = null;
      return cachedPositions;
    });
    pendingRequest.then((data) => data && setPositions(data));
  }, []);

  return positions;
};

export default usePositions;
