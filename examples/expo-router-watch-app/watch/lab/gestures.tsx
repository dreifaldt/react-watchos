import { useState } from "react";
import type { HapticType } from "react-watchos";
import {
  Button,
  CrownRotation,
  HStack,
  List,
  playHaptic,
  Text,
} from "react-watchos";
import { ObservationRows, Summary, useObservations } from "./_kit";

export const options = { title: "Gestures" };

const HAPTICS: readonly HapticType[] = [
  "click",
  "success",
  "failure",
  "notification",
];

export default function GesturesLab() {
  const { items, pass } = useObservations([
    { id: "gesture.tap", label: "Primary button: tap" },
    {
      id: "gesture.double-tap",
      label: "Primary button: double-tap fingers",
      device: "needs a real watch (no hand gesture in the simulator)",
    },
    {
      id: "gesture.crown",
      label: "Digital Crown: turn",
      device: "needs the Crown: scroll over the simulator, or a real watch",
    },
    { id: "gesture.haptic", label: "Haptics: play all four" },
  ]);
  const [presses, setPresses] = useState(0);
  const [crown, setCrown] = useState(50);
  const [played, setPlayed] = useState<string[]>([]);
  return (
    <List>
      <Summary items={items} />
      <Button
        primaryAction
        onPress={() => {
          setPresses((n) => n + 1);
          pass("gesture.tap", "onPress");
        }}
      >
        <Text>{`Primary (${presses})`}</Text>
      </Button>
      <CrownRotation
        value={crown}
        min={0}
        max={100}
        step={1}
        focused
        onChange={(value) => {
          setCrown(value);
          if (value !== 50) pass("gesture.crown", `50 → ${value}`);
        }}
      >
        <Text bold>{`Crown ${crown}`}</Text>
      </CrownRotation>
      <HStack spacing={4}>
        {HAPTICS.map((type) => (
          <Button
            key={type}
            onPress={() => {
              playHaptic(type);
              const next = played.includes(type) ? played : [...played, type];
              setPlayed(next);
              if (next.length === HAPTICS.length) {
                pass("gesture.haptic", "4 types called (silent in the simulator)");
              }
            }}
          >
            <Text size={11}>{type.slice(0, 4)}</Text>
          </Button>
        ))}
      </HStack>
      <ObservationRows items={items} />
    </List>
  );
}
