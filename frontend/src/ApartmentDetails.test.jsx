import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApartmentDetails from "./ApartmentDetails";

const apartment = {
  id: 8,
  name: "Ljubljana Riverside Loft",
  location: "Ljubljana",
  price: 149,
  rating: 4.9,
  distance: 500,
};

describe("ApartmentDetails", () => {
  it("ne prikaže ničesar brez apartmaja", () => {
    const { container } = render(<ApartmentDetails apartment={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("prikaže podrobnosti apartmaja", () => {
    render(<ApartmentDetails apartment={apartment} />);
    expect(screen.getByText("Ljubljana Riverside Loft")).toBeInTheDocument();
    expect(screen.getByText(/149 € \/ noč/)).toBeInTheDocument();
    expect(screen.getByText(/4.9 ★/)).toBeInTheDocument();
  });

  it("pokliče onClose ob kliku na gumb Zapri", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ApartmentDetails apartment={apartment} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Zapri" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
