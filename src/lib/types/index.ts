export interface HardwareInfo {
 cpu: string;
 cores: number;
 ram: number;
 gpu: string;
 platform: string;
 resolution: string;
}

export interface Window {
 id: string;
 title: string;
 icon: string;
 minimized: boolean;
 maximized: boolean;
 x: number;
 y: number;
 width: number;
 height: number;
 zIndex: number;
 workspace: number;
 prevX?: number;
 prevY?: number;
 prevWidth?: number;
 prevHeight?: number;
}

export interface FileSystemNode {
 type: 'file' | 'dir';
 path?: string;
 content?: string;
 children?: Record<string, FileSystemNode>;
}

export type BootStage = 'booting' | 'ready' | 'shutting-down';
