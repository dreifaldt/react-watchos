import { List, NavigationLink, Text } from "react-watchos";

export const options = { title: "Core Lab" };

export default function LabIndex() {
  return (
    <List>
      <NavigationLink to="/lab/text" label="Text input" />
      <NavigationLink to="/lab/controls" label="Controls" />
      <NavigationLink to="/lab/dialogs" label="Dialogs" />
      <NavigationLink to="/lab/gestures" label="Gestures" />
      <Text size={11} color="secondary">
        Each check passes when the control's event reaches JS.
      </Text>
    </List>
  );
}
