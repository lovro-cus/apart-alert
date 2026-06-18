import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// axios mockamo, da komponenta ne kliče pravega backenda.
vi.mock("axios", () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

describe("App – prijava/registracija", () => {
  it("privzeto prikaže obrazec za prijavo", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Prijava" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Geslo")).toBeInTheDocument();
  });

  it("preklopi na registracijo ob kliku 'Ustvari račun'", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Ustvari račun" }));
    expect(
      screen.getByRole("heading", { name: "Registracija" })
    ).toBeInTheDocument();
  });

  it("posodobi vrednost email polja ob tipkanju", async () => {
    const user = userEvent.setup();
    render(<App />);
    const emailInput = screen.getByPlaceholderText("Email");
    await user.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");
  });
});
