import { afterEach, describe, expect, it } from "vitest";
import { App } from "../demo/App";
import { MemoryHost, type SerializedNode } from "../src/index";
import { findByText, findByType, mountApp, resetApp } from "../src/testing";

afterEach(resetApp);

describe("demo Taps screen", () => {
  it("counts each press of its button", () => {
    const host = new MemoryHost();
    const app = mountApp(<App />, host);
    const latest = (): SerializedNode => {
      const root = host.lastCommit?.root;
      if (!root) throw new Error("nothing committed");
      return root;
    };
    const tapButton = () => {
      const match = findByType(latest(), "Button").find(
        (b) => findByText(b, "Tap me").length > 0,
      );
      if (!match) throw new Error('no Button containing "Tap me"');
      return match;
    };

    const verdict = app.dispatchEvent({
      nodeId: latest().id,
      event: "pathChange",
      payload: { path: ["/taps"] },
      seq: 1,
    });
    expect(verdict.accepted).toBe(true);
    expect(findByText(latest(), "0 taps")).toHaveLength(1);

    app.dispatchEvent({ nodeId: tapButton().id, event: "press" });
    expect(findByText(latest(), "1 tap")).toHaveLength(1);

    app.dispatchEvent({ nodeId: tapButton().id, event: "press" });
    expect(findByText(latest(), "2 taps")).toHaveLength(1);
  });
});
