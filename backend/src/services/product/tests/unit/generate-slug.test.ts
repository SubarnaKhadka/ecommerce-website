import { generateSlug } from "../../src/helpers/product.helper";
import { expect } from "@jest/globals";
import crypto from "crypto";

jest.mock("crypto", () => ({
  randomBytes: jest.fn(() => Buffer.from("abcdef", "hex")),
}));

describe("generateSlug", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should generate a slug from normal product name", () => {
    const result = generateSlug("Macbook Air 256GB");
    expect(result).toEqual({ slug: "macbook-air-256gb" });
  });

  it("should generate a slug with lowercase and remove special characters", () => {
    const result = generateSlug("Macbook! Air@ 256GB##");
    expect(result).toEqual({ slug: "macbook-air-256gb" });
  });

  it("should append a random suffix if allowRandom is true", () => {
    const result = generateSlug("Macbook Air 256GB", { allowRandom: true });
    expect(result).toEqual({ slug: "macbook-air-256gb-abcdef" });
    expect(crypto.randomBytes).toHaveBeenCalledWith(3);
  });

  it("should generate a slug without random suffix if allowRandom is false", () => {
    const result = generateSlug("Macbook Air 256GB", { allowRandom: false });
    expect(result).toEqual({ slug: "macbook-air-256gb" });
  });

  it("should handle empty string input", () => {
    const result = generateSlug("");
    expect(result).toEqual({ slug: "" });
  });

  it("should handle product names with only special characters", () => {
    const result = generateSlug("@#$%^&*");
    expect(result).toEqual({ slug: "dollarpercentand" });
  });
});
