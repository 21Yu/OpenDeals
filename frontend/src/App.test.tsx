import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("renders the main page route", () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Not authenticated")));

    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    );

    expect(screen.getByPlaceholderText("Search items...")).toBeInTheDocument();
  });
});