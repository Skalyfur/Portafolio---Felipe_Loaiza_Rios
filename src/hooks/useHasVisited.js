import { useState, useEffect } from "react";

export function useHasVisited(pageKey) {
  const [hasVisited, setHasVisited] = useState(() => {
    return sessionStorage.getItem(`visited_${pageKey}`) === "true";
  });

  useEffect(() => {
    if (!hasVisited) {
      sessionStorage.setItem(`visited_${pageKey}`, "true");
    }
  }, [pageKey, hasVisited]);

  return hasVisited;
}