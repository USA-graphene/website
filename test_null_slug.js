const slugs = [null, "some-valid-slug"];
try {
  const isDuplicate = slugs.some(s => s.includes("valid"));
  console.log("No error, result:", isDuplicate);
} catch (err) {
  console.log("Error thrown:", err.message);
}
