import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IncidentData } from "../../../../types";

const mockGenerateStructuredJson = vi.fn();

vi.mock("../client", () => ({
  generateStructuredJson: mockGenerateStructuredJson,
}));

Object.assign(import.meta.env, { VITE_GEMINI_API_KEY: "test" });

const { generateProfessionalSummary } = await import("../operations");

describe("generateProfessionalSummary", () => {
  beforeEach(() => {
    mockGenerateStructuredJson.mockReset();
  });

  it("passes a fully composed prompt with context to the structured json helper", async () => {
    mockGenerateStructuredJson.mockResolvedValue({
      title: "",
      professionalSummary: "",
    });

    const incidentData: IncidentData = {
      date: "2024-01-01",
      time: "09:30",
      jurisdiction: "California",
      caseNumber: "ABC123",
      parties: ["Parent A", "Parent B"],
      children: ["Child"],
      narrative: "Narrative details.",
      evidence: [
        {
          id: "1",
          name: "screenshot.png",
          type: "image/png",
          size: 100,
          category: "Other",
          description: "Screenshot description",
        },
      ],
    };

    await generateProfessionalSummary(incidentData);

    expect(mockGenerateStructuredJson).toHaveBeenCalledTimes(1);
    const [prompt, schema, description] = mockGenerateStructuredJson.mock.calls[0];

    expect(prompt).toContain("You are the Family Law Research Assistant");
    expect(prompt).toContain("INCIDENT DETAILS");
    expect(prompt).toContain("Parent A, Parent B");
    expect(schema).toHaveProperty("required");
    expect(description).toBe("generate professional summary");
  });
});
