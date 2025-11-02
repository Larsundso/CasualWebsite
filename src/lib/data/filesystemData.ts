/**
 * Virtual Filesystem Structure
 * Mimics a complete Linux root filesystem
 */

import fileSystemJson from "./filesystem.json" assert { type: "json" };

export const filesystem = fileSystemJson;

export const DEFAULT_PATH = "/home/lolo";
