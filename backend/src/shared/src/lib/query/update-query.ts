export function generatePartialUpdate(data: Record<string, any>) {
  const keys = Object.keys(data).filter((key) => data[key] !== undefined);
  if (keys.length === 0) return;

  const setString = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
  const values = keys.map((key) => data[key]);

  return { setString, values };
}
