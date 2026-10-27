import { Text, useParams, VStack } from "react-watchos";
import { findList } from "../../shared/lists";

export const options = { title: "List" };

export default function WatchList() {
  const { id } = useParams<"/lists/[id]">();
  const list = findList(id);
  if (!list) {
    return <Text color="secondary">{`No list ${id}`}</Text>;
  }
  return (
    <VStack spacing={4} alignment="leading">
      <Text bold size={16}>
        {list.name}
      </Text>
      {list.items.map((item) => (
        <Text key={item}>{`• ${item}`}</Text>
      ))}
    </VStack>
  );
}
