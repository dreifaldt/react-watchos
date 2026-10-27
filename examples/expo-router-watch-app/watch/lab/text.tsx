import { useState } from "react";
import { List, SecureField, Text, TextField } from "react-watchos";
import { ObservationRows, Summary, useObservations } from "./_kit";

export const options = { title: "Text input" };

const EXPECTED = "lab ok";

export default function TextLab() {
  const { items, pass } = useObservations([
    { id: "input.text-field", label: `TextField: type "${EXPECTED}"` },
    { id: "input.secure-field", label: "SecureField: type 6+ characters" },
  ]);
  const [text, setText] = useState("");
  const [secret, setSecret] = useState("");
  return (
    <List>
      <Summary items={items} />
      <TextField
        value={text}
        placeholder="Type here"
        onChange={(value) => {
          setText(value);
          if (value.trim() === EXPECTED) pass("input.text-field", `got "${value}"`);
        }}
      />
      <SecureField
        value={secret}
        placeholder="Secret"
        onChange={(value) => {
          setSecret(value);
          if (value.length >= 6) {
            pass("input.secure-field", `${value.length} chars, never shown`);
          }
        }}
      />
      <Text size={11} color="secondary">
        {`text "${text}" · secret ${secret.length} chars`}
      </Text>
      <ObservationRows items={items} />
    </List>
  );
}
