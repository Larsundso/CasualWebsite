/**
 * Terminal Command Utilities
 * All terminal command implementations
 */

import { filesystem } from "$lib/data/filesystemData";
import { systemState } from "$lib/stores/systemStore.svelte";

export interface CommandContext {
 currentPath: string;
 terminalOutput: string[];
 filesystem: typeof filesystem;
}

/**
 * Resolve a path relative to current path
 */
export function resolvePath(path: string, currentPath: string): string {
 if (path.startsWith("/")) {
  return path;
 }
 if (path === ".") {
  return currentPath;
 }
 if (path === "..") {
  const parts = currentPath.split("/").filter((p) => p);
  parts.pop();
  return "/" + parts.join("/");
 }
 if (path.startsWith("./")) {
  path = path.slice(2);
 }
 if (path.startsWith("../")) {
  const parts = currentPath.split("/").filter((p) => p);
  while (path.startsWith("../")) {
   parts.pop();
   path = path.slice(3);
  }
  return "/" + parts.join("/") + (path ? "/" + path : "");
 }
 return currentPath === "/" ? "/" + path : currentPath + "/" + path;
}

/**
 * Get a filesystem node by path
 */
export function getNode(path: string, currentPath: string): any {
 path = resolvePath(path, currentPath);
 const parts = path.split("/").filter((p) => p);
 let node = filesystem["/"];

 for (const part of parts) {
  if (!node.children || !node.children[part as keyof typeof node.children]) {
   return null;
  }
  node = node.children[
   part as keyof typeof node.children
  ] as unknown as typeof node;
 }
 return node;
}

/**
 * ls command - list directory contents
 */
export function ls(args: string[], currentPath: string): string {
 const showDetails =
  args.includes("-l") || args.includes("-la") || args.includes("-al");
 const showHidden =
  args.includes("-a") || args.includes("-la") || args.includes("-al");
 const targetPath = args.find((arg) => !arg.startsWith("-")) || ".";

 const node = getNode(targetPath, currentPath);

 if (!node) {
  return `ls: cannot access '${targetPath}': No such file or directory`;
 }
 if (node.type !== "dir") {
  return targetPath.split("/").pop() || "";
 }

 let items = Object.keys(node.children || {}).sort();

 if (showHidden) {
  items = [".", "..", ...items];
 }

 if (showDetails) {
  const lines = items.map((name) => {
   if (name === "." || name === "..") {
    return `drwxr-xr-x 1 lolo lolo 4096 ${new Date().toLocaleDateString(
     "en-US",
     { month: "short", day: "2-digit" }
    )} ${new Date().toLocaleTimeString("en-US", {
     hour: "2-digit",
     minute: "2-digit",
     hour12: false,
    })} ${name}`;
   }
   const child = node.children?.[name];
   if (!child) return "";
   const type = child.type === "dir" ? "d" : "-";
   const perms = child.type === "dir" ? "rwxr-xr-x" : "rw-r--r--";
   const size = child.type === "dir" ? "4096" : "1024";
   return `${type}${perms} 1 lolo lolo ${size.padStart(
    6
   )} ${new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
   })} ${new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
   })} ${name}`;
  });
  return lines.join("\n");
 }

 return items.join("  ");
}

/**
 * cd command - change directory
 */
export function cd(
 args: string[],
 currentPath: string
): { output: string; newPath: string } {
 if (!args[0] || args[0] === "~") {
  return { output: "", newPath: "/home/lolo" };
 }

 const targetPath = resolvePath(args[0], currentPath);
 const node = getNode(targetPath, currentPath);

 if (!node) {
  return {
   output: `cd: ${args[0]}: No such file or directory`,
   newPath: currentPath,
  };
 }
 if (node.type !== "dir") {
  return { output: `cd: ${args[0]}: Not a directory`, newPath: currentPath };
 }

 return { output: "", newPath: targetPath };
}

/**
 * cat command - display file contents
 */
export async function cat(
 args: string[],
 currentPath: string
): Promise<string> {
 if (!args[0]) {
  return "cat: missing file operand";
 }

 const node = getNode(args[0], currentPath);
 if (!node) {
  return `cat: ${args[0]}: No such file or directory`;
 }
 if (node.type !== "file") {
  return `cat: ${args[0]}: Is a directory`;
 }

 if (node.content) return node.content;

 return `cat: ${args[0]}: No content available`;
}

/**
 * pwd command - print working directory
 */
export function pwd(currentPath: string): string {
 return currentPath;
}

/**
 * help command - show available commands
 */
export function help(): string {
 return `Available commands:
  ls [path]       - List directory contents
  cd [path]       - Change directory
  pwd             - Print working directory
  cat <file>      - Display file contents
  clear           - Clear terminal
  help            - Show this help message
  neofetch        - Display system information
  uname           - Print system information
  whoami          - Print current user
  date            - Display current date and time
  echo [text]     - Print text to output`;
}

/**
 * neofetch command - display system information
 */
export function neofetch(): string {
 const hw = systemState.hardware;
 return `       /\\        lolo@arch
      /  \\       ---------
     /\\   \\      OS: Arch Linux x86_64
    /  \\   \\     Host: Hyprland
   /    \\   \\    Kernel: 6.6.10-arch1-1
  /  /\\  \\   \\   Uptime: ${systemState.uptime}
 /  /  \\  \\  /\\  Packages: 1337 (pacman)
/__/    \\__\\/  \\ Shell: zsh 5.9
                 Resolution: ${hw.resolution}
                 WM: Hyprland
                 Theme: Catppuccin-Mocha
                 Terminal: kitty
                 CPU: ${hw.cpu} (${hw.cores}C)
                 GPU: ${hw.gpu}
                 Memory: ${systemState.ramUsage}% / ${hw.ram}GB`;
}

/**
 * Tab completion for commands and paths
 */
export function handleTabCompletion(
 input: string,
 currentPath: string
): { output?: string; newInput?: string } {
 const parts = input.split(" ");
 const lastPart = parts[parts.length - 1] || "";
 const beforeLast = parts.slice(0, -1).join(" ");

 if (parts.length === 1) {
  const commands = [
   "ls",
   "cd",
   "pwd",
   "cat",
   "clear",
   "help",
   "neofetch",
   "uname",
   "whoami",
   "date",
   "echo",
  ];
  const matches = commands.filter((cmd) => cmd.startsWith(lastPart));
  if (matches.length === 1) {
   return { newInput: matches[0] };
  } else if (matches.length > 1) {
   return { output: matches.join("  ") };
  }
  return {};
 }

 const targetPath = lastPart || ".";
 let dirPath = currentPath;
 let prefix = "";

 if (targetPath.includes("/")) {
  const lastSlash = targetPath.lastIndexOf("/");
  const pathPart = targetPath.substring(0, lastSlash + 1);
  prefix = targetPath.substring(lastSlash + 1);
  dirPath = resolvePath(pathPart, currentPath);
 } else {
  prefix = targetPath;
 }

 const node = getNode(dirPath, currentPath);
 if (node && node.type === "dir" && node.children) {
  const items = Object.keys(node.children);
  const matches = items.filter((item) => item.startsWith(prefix));

  if (matches.length === 1) {
   const fullPath = targetPath.includes("/")
    ? targetPath.substring(0, targetPath.lastIndexOf("/") + 1) + matches[0]
    : matches[0];

   const matchNode = node.children[matches[0]];
   const suffix = matchNode && matchNode.type === "dir" ? "/" : "";

   return {
    newInput: beforeLast + (beforeLast ? " " : "") + fullPath + suffix,
   };
  } else if (matches.length > 1) {
   return { output: matches.join("  ") };
  }
 }

 return {};
}
