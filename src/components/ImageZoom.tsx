import { useState, useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  zoomScale?: number;
}

const ImageZoom = ({ src, alt, className, zoomScale = 2.5 }: ImageZoomProps) => {
  const [isZooming, setIsZooming] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => {
    setIsZooming(false);
    setPosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden cursor-zoom-in", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-transform duration-100",
          isZooming && "scale-100"
        )}
        style={{
          transform: isZooming
            ? `scale(${zoomScale})`
            : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`,
        }}
        draggable={false}
      />
      
      {/* Zoom indicator */}
      {!isZooming && (
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
          Hover to zoom
        </div>
      )}
    </div>
  );
};

export default ImageZoom;
