/**
 * Filesystem Utility Functions
 * Path resolution and node access for virtual filesystem
 */

import { filesystem } from "$lib/data/filesystemData";
import type { FileSystemNode } from "$lib/types";

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
export function getNode(
 path: string,
 currentPath: string
): FileSystemNode | null {
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
 return node as FileSystemNode;
}
