import { useState } from "react";
import { Button, Text, VStack } from "react-watchos";

export const options = { title: "Counter" };

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <VStack spacing={8}>
      <Text size={40} bold monospacedDigit>
        {count}
      </Text>
      <Button onPress={() => setCount((c) => c + 1)}>
        <Text>Tap me</Text>
      </Button>
    </VStack>
  );
}
