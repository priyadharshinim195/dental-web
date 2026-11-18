// Add cases with a unique id and numeric order. Cases without both comparison images are skipped.
// Use the exact paths of images placed in public/; keep optional image lists empty when unused.
// {
//   id: "<unique-id>",
//   order: 1,
//   title: "",
//   description: "",
//   beforeImage: { url: "", alt: "" },
//   afterImage: { url: "", alt: "" },
//   xrayImages: [],
//   duringSurgeryImages: [],
//   treatmentDetails: "",
// }
export const CASE_STUDIES = [
  {
    id: "case-01",
    order: 1,
    title: "Restoration of a Fractured Front Tooth",
    description: "Before: The patient presented with a fractured upper front tooth, affecting its appearance and natural structure. After: The restored tooth achieved a natural-looking appearance, blending harmoniously with the surrounding teeth.",
    beforeImage: {
      url: "/images/case-studies/case-01/case-01-before.jpg",
      alt: "Before",
    },
    afterImage: {
      url: "/images/case-studies/case-01/case-01-after.jpg",
      alt: "After",
    },
    xrayImages: [],
    duringSurgeryImages: [],
    treatmentDetails: "Treatment: The damaged tooth was carefully evaluated and restored with a custom-designed porcelain or zirconia crown to improve its strength, shape and appearance.",
  },
  {
    id: "case-02",
    order: 2,
    title: "Correction of Crowded Teeth",
    description: "Before: The patient presented with crowded and misaligned front teeth, resulting in an uneven dental appearance. After: The teeth achieved improved alignment, creating a more balanced and harmonious smile.",
    beforeImage: {
      url: "/images/case-studies/case-02/case-02-before.jpg",
      alt: "Before",
    },
    afterImage: {
      url: "/images/case-studies/case-02/case-02-after.jpg",
      alt: "After",
    },
    xrayImages: [],
    duringSurgeryImages: [],
    treatmentDetails: "Treatment: Orthodontic treatment was planned to gradually correct tooth positioning and improve overall alignment.",
  },
  {
    id: "case-03",
    order: 3,
    title: "Restoration of Decayed Molar Teeth",
    description: "Before: The patient presented with dental decay affecting two posterior molars, with visible cavities on the chewing surfaces. After: The restored teeth regained their natural shape and chewing surface contours with an improved appearance.",
    beforeImage: {
      url: "/images/case-studies/case-03/case-03-before.jpg",
      alt: "Before",
    },
    afterImage: {
      url: "/images/case-studies/case-03/case-03-after.jpg",
      alt: "After",
    },
    xrayImages: [],
    duringSurgeryImages: [],
    treatmentDetails: "Treatment: The decayed portions were removed, and the affected teeth were restored using tooth-coloured composite filling material.",
  },
];
