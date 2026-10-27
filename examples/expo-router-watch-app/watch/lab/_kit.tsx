import { useCallback, useRef, useState } from "react";
import type { ColorValue } from "react-watchos";
import { HStack, Image, Text, VStack } from "react-watchos";

/**
 * Core Lab round 2 kit (not a route: the leading "_" keeps it out of the
 * routes table). An observation passes once the wearer — or whoever drives the
 * simulator — actually does the thing, so a pass means the native control's
 * event came back into JS. Each pass logs one `[lab] <id> PASS <detail>` line.
 */

export type ObservationStatus = "waiting" | "pass" | "device";

export interface Observation {
  id: string;
  label: string;
  status: ObservationStatus;
  detail: string;
}

export interface ObservationSpec {
  id: string;
  label: string;
  /** Set when the simulator can't produce this input; shown instead of a
   *  pass/fail until a real watch (or a person at the simulator) tries it. */
  device?: string;
}

export function useObservations(specs: readonly ObservationSpec[]) {
  const [items, setItems] = useState<Observation[]>(() =>
    specs.map((spec) => ({
      id: spec.id,
      label: spec.label,
      status: spec.device ? "device" : "waiting",
      detail: spec.device ?? "waiting for input",
    })),
  );
  const logged = useRef(new Set<string>());
  const pass = useCallback((id: string, detail: string) => {
    if (!logged.current.has(id)) {
      logged.current.add(id);
      console.log(`[lab] ${id} PASS ${detail}`);
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "pass", detail } : item,
      ),
    );
  }, []);
  return { items, pass };
}

const ICONS: Record<ObservationStatus, { symbol: string; color: ColorValue }> =
  {
    waiting: { symbol: "circle.dotted", color: "secondary" },
    pass: { symbol: "checkmark.circle.fill", color: "green" },
    device: { symbol: "applewatch", color: "orange" },
  };

export function Summary({ items }: { items: readonly Observation[] }) {
  const counted = items.filter((item) => item.status !== "device");
  const passed = counted.filter((item) => item.status === "pass").length;
  const done = passed === counted.length;
  return (
    <Text bold size={15} color={done ? "green" : "orange"}>
      {`${passed}/${counted.length} observed`}
    </Text>
  );
}

export function ObservationRows({ items }: { items: readonly Observation[] }) {
  return (
    <>
      {items.map((item) => (
        <HStack key={item.id} spacing={6}>
          <Image
            systemName={ICONS[item.status].symbol}
            color={ICONS[item.status].color}
            accessibilityLabel={item.status}
          />
          <VStack spacing={1} alignment="leading">
            <Text size={13}>{item.label}</Text>
            <Text size={11} color="secondary">
              {item.detail}
            </Text>
          </VStack>
        </HStack>
      ))}
    </>
  );
}
