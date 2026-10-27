import { useState } from "react";
import {
  Alert,
  AlertAction,
  Button,
  ConfirmationDialog,
  List,
  Sheet,
  Text,
  VStack,
  ZStack,
} from "react-watchos";
import { ObservationRows, Summary, useObservations } from "./_kit";

export const options = { title: "Dialogs" };

export default function DialogsLab() {
  const { items, pass } = useObservations([
    { id: "dialog.alert-action", label: "Alert: tap OK" },
    { id: "dialog.alert-closed", label: "Alert: reports it closed" },
    { id: "dialog.confirm-action", label: "Confirmation: tap Run" },
    { id: "dialog.confirm-closed", label: "Confirmation: reports it closed" },
    { id: "dialog.sheet-js", label: "Sheet: close from its button" },
    { id: "dialog.sheet-native", label: "Sheet: close with the system ✕" },
  ]);
  const [alert, setAlert] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sheet, setSheet] = useState(false);
  return (
    <List>
      {/* The dialogs are zero-size anchors (the host attaches .alert /
          .sheet to them), layered into the summary row so they take no row. */}
      <ZStack>
        <Summary items={items} />
        <Alert
          presented={alert}
          title="Lab alert"
          message="Tap OK"
          onChange={(presented) => {
            setAlert(presented);
            if (!presented) pass("dialog.alert-closed", "onChange(false)");
          }}
        >
          <AlertAction
            label="OK"
            onPress={() => pass("dialog.alert-action", "OK onPress")}
          />
          <AlertAction label="Cancel" role="cancel" />
        </Alert>
        <ConfirmationDialog
          presented={confirm}
          title="Run the lab script?"
          onChange={(presented) => {
            setConfirm(presented);
            if (!presented) pass("dialog.confirm-closed", "onChange(false)");
          }}
        >
          <AlertAction
            label="Run"
            role="destructive"
            onPress={() => pass("dialog.confirm-action", "Run onPress")}
          />
          <AlertAction label="Cancel" role="cancel" />
        </ConfirmationDialog>
        <Sheet
          presented={sheet}
          onChange={(presented) => {
            setSheet(presented);
            if (!presented) pass("dialog.sheet-native", "onChange(false)");
          }}
        >
          <VStack spacing={6}>
            <Text bold>Lab sheet</Text>
            <Button
              onPress={() => {
                setSheet(false);
                pass("dialog.sheet-js", "presented=false from JS");
              }}
            >
              <Text>Close</Text>
            </Button>
          </VStack>
        </Sheet>
      </ZStack>
      <Button onPress={() => setAlert(true)}>
        <Text>Show alert</Text>
      </Button>
      <Button onPress={() => setConfirm(true)}>
        <Text>Show confirmation</Text>
      </Button>
      <Button onPress={() => setSheet(true)}>
        <Text>Show sheet</Text>
      </Button>
      <ObservationRows items={items} />
    </List>
  );
}
