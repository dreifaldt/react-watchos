import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LISTS } from "../shared/lists";

export default function PhoneHome() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Router Watch" }} />
      <Text style={styles.title}>Phone routes live in app/</Text>
      <Text style={styles.body}>
        The watch's routes live in watch/ and follow the same file
        conventions. Both read shared/lists.ts.
      </Text>
      {LISTS.map((list) => (
        <Link
          key={list.id}
          href={{ pathname: "/lists/[id]", params: { id: list.id } }}
          style={styles.link}
        >
          {list.name}
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: "600" },
  body: { fontSize: 15, color: "#555" },
  link: { fontSize: 17, color: "#0a7cff" },
});
