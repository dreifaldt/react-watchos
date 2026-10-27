import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { findList } from "../../shared/lists";

/** The phone twin of watch/lists/[id].tsx. */
export default function PhoneList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = findList(id);
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: list?.name ?? "List" }} />
      {list ? (
        list.items.map((item) => (
          <Text key={item} style={styles.item}>
            {`• ${item}`}
          </Text>
        ))
      ) : (
        <Text>No list {id}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  item: { fontSize: 17 },
});
