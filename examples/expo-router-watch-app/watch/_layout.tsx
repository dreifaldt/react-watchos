import { type ReactNode, useEffect } from "react";
import { ErrorBoundary, markUpdateHealthy, Text, VStack } from "react-watchos";

/**
 * The watch's root layout: wraps the whole stack, as app/_layout.tsx does for
 * the phone. Keep it to providers and boundaries; anything visible here would
 * sit outside the stack.
 */
export default function WatchLayout({ children }: { children?: ReactNode }) {
  // Inside the boundary: a first render that throws never blesses an OTA.
  useEffect(() => {
    markUpdateHealthy();
  }, []);
  return (
    <ErrorBoundary
      fallback={(error) => (
        <VStack spacing={4}>
          <Text bold color="red">
            Something broke
          </Text>
          <Text size={11} color="secondary">
            {error.message}
          </Text>
        </VStack>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
