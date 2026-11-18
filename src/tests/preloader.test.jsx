import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Preloader, { usePreloaderGate } from "../site/Preloader";
import { WEBSITE_SETTINGS } from "../data/websiteContent";

function PreloaderHarness({ ready }) {
  const phase = usePreloaderGate(ready);
  return phase === "gone"
    ? <p>Website ready</p>
    : <Preloader phase={phase} settings={WEBSITE_SETTINGS} />;
}

describe("website preloader", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("uses the uploaded logo and keeps the rotating ring separate", () => {
    render(<Preloader phase="show" settings={{
      ...WEBSITE_SETTINGS, logo_url: "/images/clinic-logo.png", logo_alt: "Clinic logo",
    }} />);
    expect(screen.getByRole("img", { name: "Clinic logo" })).toHaveAttribute("src", "/images/clinic-logo.png");
    expect(document.querySelector(".preloader-ring")).toHaveAttribute("aria-hidden", "true");
    expect(document.querySelector(".preloader-center")).toContainElement(screen.getByRole("img"));
  });

  it("uses the official transparent PNG when no custom logo is configured", () => {
    render(<Preloader phase="show" settings={WEBSITE_SETTINGS} />);
    expect(screen.getByRole("img", { name: WEBSITE_SETTINGS.logo_alt }))
      .toHaveAttribute("src", "/images/dental-care-logo.png");
  });

  it("fades away after essentials are ready", () => {
    const { rerender, container } = render(<PreloaderHarness ready={false} />);
    rerender(<PreloaderHarness ready />);
    act(() => vi.advanceTimersByTime(900));
    expect(container.querySelector(".site-preloader")).toHaveClass("is-exiting");
    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByText("Website ready")).toBeInTheDocument();
  });

  it("uses its safety timeout if content never finishes loading", () => {
    const { container } = render(<PreloaderHarness ready={false} />);
    act(() => vi.advanceTimersByTime(4999));
    expect(container.querySelector(".site-preloader")).not.toHaveClass("is-exiting");
    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector(".site-preloader")).toHaveClass("is-exiting");
    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByText("Website ready")).toBeInTheDocument();
  });
});
