let readmeContent: string = $state("");

export const readmeStore = {
 get content(): string {
  return readmeContent;
 },
 set(content: string) {
  readmeContent = content;
 },
};
