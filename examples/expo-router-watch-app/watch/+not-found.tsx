import { Text, useRoute, VStack } from "react-watchos";

export const options = { title: "Not found" };

export default function NotFound() {
  const route = useRoute();
  return (
    <VStack spacing={4}>
      <Text bold>No screen here</Text>
      <Text size={12} color="secondary">
        {route}
      </Text>
    </VStack>
  );
}
