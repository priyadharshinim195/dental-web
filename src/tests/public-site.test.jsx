import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PublicSite from "../site/PublicSite";
import { Footer } from "../site/Sections";
import { contactLink } from "../site/hooks";
import { WEBSITE_SETTINGS } from "../data/websiteContent";
import { CASE_STUDIES } from "../data/caseStudies";
import CaseStudies, { BeforeAfter, orderCaseStudies, toCardModel } from "../site/CaseStudies";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("static public website", () => {
  it("renders the existing sections without API requests or admin navigation", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<PublicSite />);

    expect(await screen.findByRole("heading", { name: "Comprehensive Dental Care" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dental Care" })).toBeInTheDocument();
    expect(document.title).toBe(WEBSITE_SETTINGS.seo_title);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", WEBSITE_SETTINGS.seo_description);
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute("content", WEBSITE_SETTINGS.seo_title);
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute("content", WEBSITE_SETTINGS.seo_description);
    expect(screen.getByRole("heading", { name: "Patient Feedback" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A Glimpse Inside Our Clinic" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses the requested WhatsApp and phone numbers", () => {
    const { container } = render(<PublicSite />);
    const whatsappLinks = container.querySelectorAll('a[href^="https://wa.me/"]');
    expect(whatsappLinks.length).toBeGreaterThan(0);
    whatsappLinks.forEach((link) => {
      expect(link.href).toContain("https://wa.me/917448944820?text=");
      expect(link.target).toBe("_blank");
      expect(link.rel).toContain("noopener");
    });
    const phoneLinks = container.querySelectorAll('a[href^="tel:"]');
    expect(phoneLinks.length).toBeGreaterThan(0);
    phoneLinks.forEach((link) => expect(link.getAttribute("href")).toBe("tel:+917448944820"));
    expect(screen.getByText("[Clinic address to be added]")).toBeInTheDocument();
  });

  it("renders the static case studies route and its back link", () => {
    const previousUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.pushState({}, "", "/case-studies/");
    try {
      render(<PublicSite />);
      expect(screen.getByRole("heading", { name: "All Case Studies" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Back to Case Studies/ })).toHaveAttribute("href", "/#case-studies");
      expect(screen.queryByRole("heading", { name: "Dental Care" })).not.toBeInTheDocument();
    } finally {
      window.history.replaceState({}, "", previousUrl);
    }
  });

  it("smoothly scrolls to the case studies section on its landing-page anchor", async () => {
    const previousUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    window.history.pushState({}, "", "/#case-studies");
    try {
      render(<PublicSite />);
      await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      }));
      expect(document.getElementById("case-studies")).toBeInTheDocument();
    } finally {
      window.history.replaceState({}, "", previousUrl);
      delete window.HTMLElement.prototype.scrollIntoView;
    }
  });
});

describe("contact links", () => {
  it("builds a WhatsApp link using only digits", () => {
    const link = contactLink("whatsapp", { ...WEBSITE_SETTINGS, whatsapp_number: "+91 98765-43210" }, "Hi there");
    expect(link.href).toBe("https://wa.me/919876543210?text=Hi%20there");
  });

  it("uses the specified clinic WhatsApp number and enquiry message", () => {
    const link = contactLink("whatsapp", WEBSITE_SETTINGS,
      "Hello Dental Care, I would like to enquire about your dental services.");
    expect(link.href).toBe("https://wa.me/917448944820?text=Hello%20Dental%20Care%2C%20I%20would%20like%20to%20enquire%20about%20your%20dental%20services.");
  });

  it("builds a phone link with the plus sign intact", () => {
    expect(contactLink("phone", { ...WEBSITE_SETTINGS, phone: "+91 98765 43210" }).href)
      .toBe("tel:+919876543210");
  });
});

describe("footer branding", () => {
  it("uses the local logo and clinic name", () => {
    const { container } = render(<Footer content={{ "footer.tagline": "" }}
      settings={WEBSITE_SETTINGS} visible={{}} />);
    const brand = container.querySelector(".footer-brand");
    expect(brand.querySelector("img")).toHaveAttribute("src", "/images/dental-care-logo.png");
    expect(brand).toHaveTextContent("Dental Care");
  });

  it("returns footer section links to the landing page from the case studies route", () => {
    const { container } = render(<Footer content={{ "footer.tagline": "" }}
      settings={WEBSITE_SETTINGS} visible={{}} homePage={false} />);
    expect(container.querySelector('.footer-brand')).toHaveAttribute("href", "/#home");
    expect(container.querySelector('.footer-links a[href="/#about"]')).toBeInTheDocument();
  });
});

describe("case study comparison and details", () => {
  const base = {
    id: "s", order: 1, title: "T", description: "Description",
    beforeImage: { url: "/images/before.jpg", alt: "Before" },
    afterImage: { url: "/images/after.jpg", alt: "After" },
    xrayImages: [], duringSurgeryImages: [], treatmentDetails: "",
  };
  const pairedStudy = (index) => ({
    ...base,
    id: `case-${index}`,
    order: index,
    title: `Case ${index}`,
    beforeImage: { url: `/images/before-${index}.jpg`, alt: `Before case ${index}` },
    afterImage: { url: `/images/after-${index}.jpg`, alt: `After case ${index}` },
  });

  it("renders the uploaded local before-and-after image pair from static data", () => {
    const { container } = render(<CaseStudies content={{}} publishedCases={CASE_STUDIES} limit={6} />);
    expect(screen.getByRole("heading", { name: "Restoration of a Fractured Front Tooth" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Correction of Crowded Teeth" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Restoration of Decayed Molar Teeth" })).toBeInTheDocument();
    expect(screen.getByText(/fractured upper front tooth/)).toBeInTheDocument();
    expect(screen.getByText(/crowded and misaligned front teeth/)).toBeInTheDocument();
    expect(screen.getByText(/dental decay affecting two posterior molars/)).toBeInTheDocument();
    expect(CASE_STUDIES.map((study) => study.treatmentDetails)).toEqual([
      "Treatment: The damaged tooth was carefully evaluated and restored with a custom-designed porcelain or zirconia crown to improve its strength, shape and appearance.",
      "Treatment: Orthodontic treatment was planned to gradually correct tooth positioning and improve overall alignment.",
      "Treatment: The decayed portions were removed, and the affected teeth were restored using tooth-coloured composite filling material.",
    ]);
    expect(container.querySelector('.ba-img-before')).toHaveAttribute(
      "src", "/images/case-studies/case-01/case-01-before.jpg",
    );
    expect(container.querySelector('.ba-img-after')).toHaveAttribute(
      "src", "/images/case-studies/case-01/case-01-after.jpg",
    );
    expect(container.querySelector('img[src="/images/case-studies/case-02/case-02-before.jpg"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/images/case-studies/case-02/case-02-after.jpg"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/images/case-studies/case-03/case-03-before.jpg"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/images/case-studies/case-03/case-03-after.jpg"]')).toBeInTheDocument();
  });

  it("only maps separate before and after images into a comparison", () => {
    const composite = toCardModel({
      ...base, beforeImage: null, afterImage: null,
    }, 0);
    expect(composite.before).toBeNull();
    expect(composite.after).toBeNull();
    expect(composite.overview).toBe("Description");

    const paired = toCardModel({ ...base, order: 2 }, 1);
    expect(paired.before.url).toBe("/images/before.jpg");
    expect(paired.number).toBe("Case Study 02");
  });

  it("orders cases by the configured order and keeps source order for ties", () => {
    const cases = [
      { ...pairedStudy(3), id: "third" },
      { ...pairedStudy(1), id: "first" },
      { ...pairedStudy(1), id: "also-first" },
    ];
    expect(orderCaseStudies(cases).map((study) => study.id))
      .toEqual(["first", "also-first", "third"]);
  });

  it("supports keyboard controls on before-and-after sliders", () => {
    render(<BeforeAfter before={{ url: "/before.jpg" }} after={{ url: "/after.jpg" }} />);
    const handle = screen.getByRole("slider", { name: "Compare before and after" });
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(handle).toHaveAttribute("aria-valuenow", "52");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle).toHaveAttribute("aria-valuenow", "0");
    fireEvent.keyDown(handle, { key: "End" });
    expect(handle).toHaveAttribute("aria-valuenow", "100");
  });

  it("tracks pointer dragging across the comparison area", () => {
    const { container } = render(<BeforeAfter before={{ url: "/before.jpg" }} after={{ url: "/after.jpg" }} />);
    const comparison = container.querySelector(".ba-compare");
    vi.spyOn(comparison, "getBoundingClientRect").mockReturnValue({
      left: 0, right: 200, top: 0, bottom: 150, width: 200, height: 150, x: 0, y: 0, toJSON: () => ({}),
    });
    const handle = screen.getByRole("slider", { name: "Compare before and after" });
    const pointerDown = new Event("pointerdown", { bubbles: true, cancelable: true });
    Object.defineProperties(pointerDown, { pointerId: { value: 7 }, clientX: { value: 40 } });
    fireEvent(handle, pointerDown);
    expect(handle).toHaveAttribute("aria-valuenow", "20");
    const pointerMove = new Event("pointermove", { bubbles: true });
    Object.defineProperties(pointerMove, { pointerId: { value: 7 }, clientX: { value: 140 } });
    fireEvent(handle, pointerMove);
    expect(handle).toHaveAttribute("aria-valuenow", "70");
    const pointerUp = new Event("pointerup", { bubbles: true });
    Object.defineProperty(pointerUp, "pointerId", { value: 7 });
    fireEvent(handle, pointerUp);
  });

  it("keeps the comparison slider in case cards and details", async () => {
    render(<CaseStudies content={{}} publishedCases={[
      { ...base, id: "incomplete", title: "Incomplete case", beforeImage: null, afterImage: null },
      { ...pairedStudy(1), id: "paired", title: "Paired case" },
    ]} />);
    expect(screen.queryByRole("heading", { name: "Incomplete case" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Paired case", level: 3 })).toBeInTheDocument();
    expect(screen.getAllByRole("slider", { name: "Compare before and after" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /View Case Study/ }));
    await screen.findByRole("heading", { name: "Paired case", level: 2 });
    expect(screen.getAllByRole("slider", { name: "Compare before and after" })).toHaveLength(2);
  });

  it("shows each case's x-ray and surgery images in treatment details", async () => {
    const study = {
      ...pairedStudy(2),
      treatmentDetails: "Treatment notes for this manually entered case.",
      xrayImages: [
        { url: "/images/xray-one.jpg", alt: "X-ray one" },
        { url: "/images/xray-two.jpg", alt: "X-ray two" },
      ],
      duringSurgeryImages: [
        { url: "/images/surgery-one.jpg", alt: "Surgery one" },
        { url: "/images/surgery-two.jpg", alt: "Surgery two" },
      ],
    };
    const { container } = render(<CaseStudies content={{}} publishedCases={[study]} />);
    const card = container.querySelector('[data-case-card="case-2"]');
    fireEvent.click(within(card).getByRole("button", { name: "View Treatment Details" }));
    expect(await screen.findByRole("heading", { name: "Case 2", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "X-Ray Images" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "During Surgery" })).toBeInTheDocument();
    expect(screen.getByText("Treatment notes for this manually entered case.")).toBeInTheDocument();
    expect(container.querySelectorAll(".case-treatment-gallery img")).toHaveLength(4);
    expect(container.querySelector('img[src="/images/xray-two.jpg"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/images/surgery-two.jpg"]')).toBeInTheDocument();
    expect(container.querySelector(".case-dialog [role=slider]")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to Case Studies" }));
    expect(screen.queryByRole("heading", { name: "Case 2", level: 2 })).not.toBeInTheDocument();
  });

  it("shows at most six landing-page cases and links to the full page", () => {
    const studies = Array.from({ length: 7 }, (_, index) => pairedStudy(7 - index));
    const orderedTitles = studies.slice().sort((left, right) => left.order - right.order)
      .map((study) => study.title);
    const { rerender } = render(<CaseStudies content={{}} publishedCases={studies} limit={6} />);
    expect(screen.getAllByRole("button", { name: /View Case Study/ })).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: "View Treatment Details" })).toHaveLength(6);
    expect(screen.getByRole("link", { name: /Explore All Cases/ })).toHaveAttribute("href", "/case-studies/");
    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent))
      .toEqual(orderedTitles.slice(0, 6));
    rerender(<CaseStudies content={{}} publishedCases={studies} page />);
    expect(screen.getAllByRole("button", { name: /View Case Study/ })).toHaveLength(7);
    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent))
      .toEqual(orderedTitles);
  });
});
