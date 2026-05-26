"use client";

import { Stage, Layer, Line, Rect, Circle } from 'react-konva';
import { useRef, useEffect, useState, memo } from 'react';
import { useDrawingStore } from '@/lib/store/use-drawing-store';
import Konva from 'konva';
import { DrawLine } from '@/types/studio';

const FinishedLines = memo(({ lines }: { lines: DrawLine[] }) => {
    return (
        <>
            {lines.map((line, i) => (
                <RenderShape key={i} shape={line} />
            ))}
        </>
    );
});

FinishedLines.displayName = 'FinishedLines';

export default function DrawingCanvas() {
  const lines = useDrawingStore((state) => state.lines);
  const addLine = useDrawingStore((state) => state.addLine);
  const tool = useDrawingStore((state) => state.tool);
  const color = useDrawingStore((state) => state.color);
  const strokeWidth = useDrawingStore((state) => state.strokeWidth);
  
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [localCurrentLine, setLocalCurrentLine] = useState<DrawLine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // Handle container resize to keep canvas responsive using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setLocalCurrentLine({
          tool,
          color: tool === 'eraser' ? '#ffffff' : color,
          strokeWidth,
          points: [pos.x, pos.y]
      });
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current || !localCurrentLine) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    
    if (point) {
        let newPoints = [...localCurrentLine.points];
        
        if (tool === 'brush' || tool === 'eraser') {
            newPoints = newPoints.concat([point.x, point.y]);
        } else if (tool === 'rect' || tool === 'circle') {
            // For shapes, we keep the start point and update the end point (stored as the 3rd and 4th values)
            newPoints = [newPoints[0], newPoints[1], point.x, point.y];
        }
        
        setLocalCurrentLine({
            ...localCurrentLine,
            points: newPoints
        });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current && localCurrentLine) {
        addLine(localCurrentLine);
    }
    isDrawing.current = false;
    setLocalCurrentLine(null);
  };

  return (
    <div ref={containerRef} className="w-full h-full touch-none cursor-crosshair">
      <Stage
        width={size.width}
        height={size.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {/* Render existing lines and shapes - Optimized with memo */}
          <FinishedLines lines={lines} />
          
          {/* Render current drawing action - Now uses local state for ultra-smooth updates */}
          {localCurrentLine && <RenderShape shape={localCurrentLine} />}
        </Layer>
      </Stage>
    </div>
  );
}


function RenderShape({ shape }: { shape: DrawLine }) {
    if (shape.tool === 'brush' || shape.tool === 'eraser') {
        return (
            <Line
                points={shape.points}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                    shape.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
            />
        );
    }
    
    if (shape.tool === 'rect' && shape.points.length >= 4) {
        const x1 = shape.points[0];
        const y1 = shape.points[1];
        const x2 = shape.points[2];
        const y2 = shape.points[3];
        
        return (
            <Rect
                x={Math.min(x1, x2)}
                y={Math.min(y1, y2)}
                width={Math.abs(x2 - x1)}
                height={Math.abs(y2 - y1)}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
            />
        );
    }
    
    if (shape.tool === 'circle' && shape.points.length >= 4) {
        const x1 = shape.points[0];
        const y1 = shape.points[1];
        const x2 = shape.points[2];
        const y2 = shape.points[3];
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        return (
            <Circle
                x={x1}
                y={y1}
                radius={radius}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
            />
        );
    }
    
    return null;
}
