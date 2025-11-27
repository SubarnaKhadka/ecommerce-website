import crypto from "crypto";
import slugify from "slugify";

export function generateSlug(
  productName: string,
  options?: {
    allowRandom?: boolean;
  }
) {
  let slug = slugify(productName, {
    lower: true,
    strict: true,
  });
  if (options?.allowRandom) {
    slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
  }

  return { slug };
}
