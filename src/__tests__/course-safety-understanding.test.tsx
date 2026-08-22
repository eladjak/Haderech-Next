import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SafetyUnderstandingCheck } from "@/components/course/safety-understanding-check";

afterEach(cleanup);

describe("course safety understanding check", () => {
  it("is optional, local-only, and gives corrective feedback without a score", () => {
    render(<SafetyUnderstandingCheck />);

    expect(screen.getByText(/אין ציון/u)).toBeInTheDocument();
    expect(screen.getByText(/התשובות לא נשמרות/u)).toBeInTheDocument();
    expect(screen.getByText(/אפשר לדלג עליה/u)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("radio", {
        name: /מבקשים עוד דקה/u,
      }),
    );
    expect(screen.getByText(/בקשת עצירה קודמת/u)).toBeInTheDocument();
    expect(screen.getByText(/0 מתוך 3/u)).toBeInTheDocument();
  });

  it("confirms both safety principles after safe choices", () => {
    render(<SafetyUnderstandingCheck />);

    fireEvent.click(
      screen.getByRole("radio", {
        name: /עוצרים מיד/u,
      }),
    );
    fireEvent.click(
      screen.getByRole("radio", {
        name: /הבטיחות קודמת לסגירת מעגל/u,
      }),
    );
    fireEvent.click(
      screen.getByRole("radio", {
        name: /זהו קורס חינוכי/u,
      }),
    );

    expect(
      screen.getByText(/שלושת העקרונות ברורים/u),
    ).toBeInTheDocument();
  });
});
