"use client";

import { fireEvent, render, screen } from "@/lib/utils";

import { vi } from "@/lib/utils";
import { MessageInput } from "@/lib/utils";

describe("MessageInput",  => {
  const defaultProps = {
    message: "",
    isLoading: false,
    onChange: vi.fn,
    onSubmit: vi.fn};

  beforeEach( => {
    vi.clearAllMocks();
  });

  it("renders input and submit button", () => {
    render(<MessageInput {...defaultProps} />);
    expect(screen.getByPlaceholderText("הקלד הודעה...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "שלח" })).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<MessageInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText("הקלד הודעה...");
    fireEvent.change(input, { target: { value: "הודעה חדשה" } });

    expect(onChange).toHaveBeenCalledWith("הודעה חדשה");
  });

  it("calls onSubmit when form is submitted", () => {
    const onSubmit = vi.fn();
    render(<MessageInput {...defaultProps} onSubmit={onSubmit} />);

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalled();
  });

  it("disables input and button when loading", () => {
    render(<MessageInput {...defaultProps} isLoading={true} />);

    expect(screen.getByPlaceholderText("הקלד הודעה...")).toBeDisabled();
    expect(screen.getByRole("button", { name: "שלח" })).toBeDisabled();
  });

  it("disables submit button when message is empty", () => {
    render(<MessageInput {...defaultProps} message="" />);
    expect(screen.getByRole("button", { name: "שלח" })).toBeDisabled();
  });

  it("enables submit button when message is not empty", () => {
    render(<MessageInput {...defaultProps} message="הודעה" />);
    expect(screen.getByRole("button", { name: "שלח" })).toBeEnabled();
  });

  it("limits message length to 1000 characters", () => {
    const onChange = vi.fn();
    render(<MessageInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    const longMessage = "א".repeat(1500);

    fireEvent.change(input, { target: { value: longMessage } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows correct character count", () => {
    render(<MessageInput {...defaultProps} message="הודעה" />);
    expect(screen.getByText("5/1000")).toBeInTheDocument();
  });

  it("handles undefined message prop correctly", () => {
    render(<MessageInput {...defaultProps} message={undefined} />);
    expect(screen.getByPlaceholderText("הקלד הודעה...")).toHaveValue("");
  });
});
