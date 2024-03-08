export function randomSize(url: string) {
  const urlSplit = url.split("/");
  const [originWidth, originHeight] = urlSplit.splice(-2);
  const width = Math.floor(Math.random() * 200 + 280);
  const height = Math.floor(Math.random() * 100 + 300);
  return [...urlSplit, width, height].join("/");
}
