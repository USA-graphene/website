async function run() {
  const arxivUrl = `https://export.arxiv.org/api/query?search_query=ti:graphene&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`;
  const arxivRes = await fetch(arxivUrl);
  const arxivXml = await arxivRes.text();
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(arxivXml)) !== null) {
    const entry = match[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim();
    console.log(title);
  }
}
run();
