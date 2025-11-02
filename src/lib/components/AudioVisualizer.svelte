<script lang="ts">
 import { onMount, onDestroy } from "svelte";

 interface AnalyserWithColor {
  analyser: AnalyserNode;
  color: string;
  name: string;
 }

 interface Props {
  analyser?: AnalyserNode | null;
  analysers?: AnalyserWithColor[];
  width?: number;
  height?: number;
  barColor?: string;
  barCount?: number;
  className?: string;
  mode?: "bars" | "line" | "multiline";
 }

 let {
  analyser,
  analysers = [],
  width = 300,
  height = 60,
  barColor = "#cba6f7",
  barCount = 32,
  className = "",
  mode = "bars",
 }: Props = $props();

 let canvas: HTMLCanvasElement | null = $state(null);
 let animationId: number | null = null;

 function drawBars(
  ctx: CanvasRenderingContext2D,
  dataArray: Uint8Array,
  bufferLength: number
 ) {
  const barWidth = width / barCount;
  const step = Math.floor(bufferLength / barCount);

  for (let i = 0; i < barCount; i++) {
   let sum = 0;
   for (let j = 0; j < step; j++) {
    sum += dataArray[i * step + j];
   }
   const average = sum / step;
   const barHeight = (average / 255) * height;

   const x = i * barWidth;
   const y = height - barHeight;

   const gradient = ctx.createLinearGradient(0, height, 0, 0);
   gradient.addColorStop(0, barColor + "40");
   gradient.addColorStop(1, barColor);

   ctx.fillStyle = gradient;
   ctx.fillRect(x, y, barWidth - 2, barHeight);

   ctx.shadowBlur = 10;
   ctx.shadowColor = barColor;
   ctx.fillRect(x, y, barWidth - 2, barHeight);
   ctx.shadowBlur = 0;
  }
 }

 function drawLine(
  ctx: CanvasRenderingContext2D,
  dataArray: Uint8Array,
  bufferLength: number,
  color: string = barColor
 ) {
  const sliceWidth = width / barCount;
  const step = Math.floor(bufferLength / barCount);

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < barCount; i++) {
   let sum = 0;
   for (let j = 0; j < step; j++) {
    sum += dataArray[i * step + j];
   }
   const average = sum / step;
   const pointHeight = (average / 255) * (height * 0.8);

   points.push({
    x: i * sliceWidth,
    y: height - pointHeight - height * 0.1,
   });
  }

  const gradient = ctx.createLinearGradient(0, height, 0, 0);
  gradient.addColorStop(0, color + "10");
  gradient.addColorStop(0.5, color + "30");
  gradient.addColorStop(1, color + "60");

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
   const xc = (points[i].x + points[i + 1].x) / 2;
   const yc = (points[i].y + points[i + 1].y) / 2;
   ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  const lastPoint = points[points.length - 1];
  ctx.lineTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(width, height);
  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
   const xc = (points[i].x + points[i + 1].x) / 2;
   const yc = (points[i].y + points[i + 1].y) / 2;
   ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  ctx.lineTo(lastPoint.x, lastPoint.y);

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.shadowColor = color;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.stroke();
 }

 function drawMultiLine(ctx: CanvasRenderingContext2D) {
  for (const item of analysers) {
   if (!item.analyser) continue;

   const bufferLength = item.analyser.frequencyBinCount;
   const dataArray = new Uint8Array(bufferLength);
   item.analyser.getByteFrequencyData(dataArray);

   drawLine(ctx, dataArray, bufferLength, item.color);
  }
 }

 function draw() {
  if (!canvas) {
   animationId = requestAnimationFrame(draw);
   return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, width, height);

  if (mode === "multiline") {
   drawMultiLine(ctx);
  } else if (analyser) {
   const bufferLength = analyser.frequencyBinCount;
   const dataArray = new Uint8Array(bufferLength);
   analyser.getByteFrequencyData(dataArray);

   if (mode === "line") {
    drawLine(ctx, dataArray, bufferLength);
   } else {
    drawBars(ctx, dataArray, bufferLength);
   }
  }

  animationId = requestAnimationFrame(draw);
 }

 onMount(() => {
  animationId = requestAnimationFrame(draw);
 });

 onDestroy(() => {
  if (animationId !== null) cancelAnimationFrame(animationId);
 });
</script>

<canvas bind:this={canvas} {width} {height} class="audio-visualizer {className}"
></canvas>

<style>
 .audio-visualizer {
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(203, 166, 247, 0.2);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
 }
</style>
