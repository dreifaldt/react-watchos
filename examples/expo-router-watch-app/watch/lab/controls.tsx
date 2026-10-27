import { useRef, useState } from "react";
import {
  DatePicker,
  List,
  Picker,
  Slider,
  Stepper,
  Text,
  Toggle,
} from "react-watchos";
import { ObservationRows, Summary, useObservations } from "./_kit";

export const options = { title: "Controls" };

const FRUITS = ["Apple", "Pear", "Plum"];
const SLIDER_START = 5;
const STEPPER_START = 1;

function clock(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ControlsLab() {
  const { items, pass } = useObservations([
    { id: "input.toggle", label: "Toggle: on, then off" },
    { id: "input.slider", label: "Slider: change it" },
    { id: "input.stepper", label: "Stepper: step up" },
    { id: "input.picker", label: "Picker: choose Plum" },
    { id: "input.date-picker", label: "DatePicker: change the time" },
  ]);
  const [on, setOn] = useState(false);
  const wasOn = useRef(false);
  const [slider, setSlider] = useState(SLIDER_START);
  const [stepper, setStepper] = useState(STEPPER_START);
  const [fruit, setFruit] = useState(0);
  const [start] = useState(() => Math.floor(Date.now() / 60_000) * 60_000);
  const [time, setTime] = useState(start);
  return (
    <List>
      <Summary items={items} />
      <Toggle
        label="Lab switch"
        value={on}
        onChange={(value) => {
          setOn(value);
          if (value) wasOn.current = true;
          else if (wasOn.current) pass("input.toggle", "on → off round trip");
        }}
      />
      <Slider
        value={slider}
        min={0}
        max={10}
        step={1}
        onChange={(value) => {
          setSlider(value);
          if (value !== SLIDER_START) {
            pass("input.slider", `${SLIDER_START} → ${value}`);
          }
        }}
      />
      <Stepper
        label={`Count ${stepper}`}
        value={stepper}
        min={0}
        max={9}
        onChange={(value) => {
          setStepper(value);
          if (value > STEPPER_START) {
            pass("input.stepper", `${STEPPER_START} → ${value}`);
          }
        }}
      />
      <Picker
        label="Fruit"
        options={FRUITS}
        value={fruit}
        onChange={(index) => {
          setFruit(index);
          if (FRUITS[index] === "Plum") pass("input.picker", `index ${index}`);
        }}
      />
      <DatePicker
        label="Time"
        mode="hourAndMinute"
        value={time}
        onChange={(value) => {
          setTime(value);
          if (value !== start) {
            pass("input.date-picker", `${clock(start)} → ${clock(value)}`);
          }
        }}
      />
      <Text size={11} color="secondary">
        {`${on ? "on" : "off"} · slider ${slider} · ${FRUITS[fruit] ?? "?"} · ${clock(time)}`}
      </Text>
      <ObservationRows items={items} />
    </List>
  );
}
