import { useState } from "react";
import { List, SecureField, Text, TextField } from "react-watchos";
import { ObservationRows, Summary, useObservations } from "./_kit";

export const options = { title: "Text input" };

const EXPECTED = "lab ok";

export default function TextLab() {
  const { items, pass } = useObservations([
    { id: "input.text-field", label: "TextField: any text reaches JS" },
    {
      id: "input.text-verbatim",
      label: `Verbatim field: type "${EXPECTED}"`,
    },
    { id: "input.secure-field", label: "SecureField: type 6+ characters" },
  ]);
  const [text, setText] = useState("");
  const [verbatim, setVerbatim] = useState("");
  const [secret, setSecret] = useState("");
  return (
    <List>
      <Summary items={items} />
      {/* System defaults: the watch keyboard capitalizes and autocorrects. */}
      <TextField
        value={text}
        placeholder="Type here"
        onChange={(value) => {
          setText(value);
          if (value) pass("input.text-field", `got "${value}"`);
        }}
      />
      {/* What a token, username or URL field needs. */}
      <TextField
        value={verbatim}
        placeholder="Verbatim"
        autoCorrect={false}
        autoCapitalize="none"
        onChange={(value) => {
          setVerbatim(value);
          if (value.trim() === EXPECTED) {
            pass("input.text-verbatim", `got "${value}" unchanged`);
          }
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
        {`"${text}" · "${verbatim}" · secret ${secret.length}`}
      </Text>
      <ObservationRows items={items} />
    </List>
  );
}
