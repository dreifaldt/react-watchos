import type { ReactNode } from "react";
import { Text, VStack } from "react-watchos";

/** Wraps every screen under watch/lists/. */
export default function ListsLayout({ children }: { children?: ReactNode }) {
  return (
    <VStack spacing={6}>
      {children}
      <Text size={10} color="secondary">
        watch/lists/_layout.tsx
      </Text>
    </VStack>
  );
}
