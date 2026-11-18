import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Gallery, Services, Testimonials } from "../site/Sections";
import { WEBSITE_CONTENT } from "../data/websiteContent";

describe("static public content", () => {
  it("uses editable service titles and descriptions without changing card structure", () => {
    render(<Services content={{
      ...WEBSITE_CONTENT,
      "services.1.title": "Custom dental service",
      "services.1.text": "Updated service description.",
    }} />);

    expect(screen.getByRole("heading", { name: "Custom dental service" })).toBeInTheDocument();
    expect(screen.getByText("Updated service description.")).toBeInTheDocument();
    expect(document.querySelectorAll(".service-card")).toHaveLength(8);
  });

  it("renders static service records and their local images in saved order", () => {
    render(<Services content={WEBSITE_CONTENT} services={[
      {
        id: 21, title: "Implant consultation", description: "A managed service.",
        image_url: "/images/services/implant.png", image_alt: "Implant consultation room",
        image_width: 900, image_height: 600,
      },
    ]} />);

    expect(screen.getByRole("heading", { name: "Implant consultation" })).toBeInTheDocument();
    expect(screen.getByText("A managed service.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Implant consultation room" })).toHaveAttribute("src", "/images/services/implant.png");
    expect(document.querySelectorAll(".service-card")).toHaveLength(1);
  });

  it("renders static gallery images and testimonials", () => {
    render(
      <>
        <Gallery content={WEBSITE_CONTENT} images={[{ id: 8, url: "/images/room.jpg", alt: "Clinic room" }]} />
        <Testimonials content={WEBSITE_CONTENT} items={[{
          id: 4, display_name: "Anonymous patient", quote: "The team made me feel comfortable.",
        }]} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Clinic room" })).toHaveAttribute("src", "/images/room.jpg");
    expect(screen.getByText("Anonymous patient")).toBeInTheDocument();
    expect(screen.getByText("The team made me feel comfortable.")).toBeInTheDocument();
    expect(screen.queryByText("Placeholder · Not a patient review")).not.toBeInTheDocument();
  });

  it("does not display bundled testimonial placeholders when the database has no published records", () => {
    render(<Testimonials content={WEBSITE_CONTENT} items={[]} />);

    expect(screen.queryByText("Placeholder · Not a patient review")).not.toBeInTheDocument();
    expect(screen.queryByText(/Placeholder for an approved patient review/)).not.toBeInTheDocument();
  });

  it("hides a missing static gallery image without breaking the gallery", () => {
    const { container } = render(<Gallery content={WEBSITE_CONTENT}
      images={[{ src: "/images/missing.jpg", alt: "Optional clinic photo" }]} />);
    const image = screen.getByRole("img", { name: "Optional clinic photo" });
    fireEvent.error(image);
    expect(image).toHaveAttribute("hidden");
    expect(container.querySelector(".gallery-grid")).toBeInTheDocument();
  });
});
