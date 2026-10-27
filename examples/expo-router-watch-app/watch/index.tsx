import { href, List, NavigationLink } from "react-watchos";
import { LISTS } from "../shared/lists";

export const options = { title: "Router Watch" };

export default function WatchHome() {
  return (
    <List>
      <NavigationLink to="/lab" label="Core Lab" />
      <NavigationLink to="/counter" label="Counter" />
      {LISTS.map((list) => (
        <NavigationLink
          key={list.id}
          to={href("/lists/[id]", { id: list.id })}
          label={list.name}
        />
      ))}
      <NavigationLink to="/about" label="About" />
      <NavigationLink to="/nowhere" label="Broken link" />
    </List>
  );
}
