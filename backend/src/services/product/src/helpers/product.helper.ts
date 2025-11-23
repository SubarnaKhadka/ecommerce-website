import crypto from "crypto";
import slugify from "slugify";

export function generateSlug(productName: string) {
  const baseSlug = slugify(productName, { lower: true, strict: true });
  const slug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;
  return { slug };
}
