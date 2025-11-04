export async function fetchReadme(): Promise<string> {
 try {
  const response = await fetch('https://raw.githubusercontent.com/Larsundso/Larsundso/main/README.md');

  if (!response.ok) {
   console.warn(`Failed to fetch README: ${response.status}`);
   return getFallbackReadme();
  }

  const markdown = await response.text();
  return markdown;
 } catch (error) {
  console.error('Error fetching README:', error);
  return getFallbackReadme();
 }
}

function getFallbackReadme(): string {
 return `# README

Failed to load README from GitHub.

Please check your connection or try again later.`;
}
