import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("../config", () => ({
  getClient: () => ({
    models: {
      generateContent: mockGenerateContent,
    },
  }),
  MODEL_NAME: "test-model",
}));

const { generateStructuredJson } = await import("../client");

describe("generateStructuredJson", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockGenerateContent.mockReset();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("throws a descriptive error when the response contains malformed JSON", async () => {
    mockGenerateContent.mockResolvedValue({
      text: "{ invalid json",
    });

    await expect(
      generateStructuredJson("prompt", {}, "perform operation")
    ).rejects.toThrow(
      "The AI returned an invalid JSON response, which could be due to safety settings or an unexpected output."
    );
  });

  it("throws a generic error when the client fails without a syntax issue", async () => {
    mockGenerateContent.mockRejectedValue(new Error("boom"));

    await expect(
      generateStructuredJson("prompt", {}, "perform operation")
    ).rejects.toThrow("Failed to perform operation.");
  });
});
