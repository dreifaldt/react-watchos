import { Text, VStack } from "react-watchos";

export const options = { title: "About" };

/** In a (settings) group, so its path is /about, not /settings/about. */
export default function About() {
  return (
    <VStack spacing={4}>
      <Text bold>File-based routes</Text>
      <Text size={12} color="secondary">
        Every screen here is a file in watch/.
      </Text>
    </VStack>
  );
}
