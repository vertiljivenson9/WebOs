import { useRef, useState, useEffect } from 'react';
import { 
  Pencil, Eraser, Square, Circle as CircleIcon, 
  Minus, PaintBucket, Download, Trash2
} from 'lucide-react';

type Tool = 'brush' | 'eraser' | 'line' | 'rect' | 'circle' | 'fill';

export const Paint: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
    '#0088ff', '#88ff00', '#ff0088', '#888888', '#333333'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);

    if (tool === 'fill') {
      floodFill(Math.floor(pos.x), Math.floor(pos.y), color);
      setIsDrawing(false);
      return;
    }

    // Save snapshot for shapes
    if (['line', 'rect', 'circle'].includes(tool)) {
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (tool) {
      case 'brush':
        ctx.strokeStyle = color;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;

      case 'eraser':
        ctx.strokeStyle = '#ffffff';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;

      case 'line':
        if (snapshot) ctx.putImageData(snapshot, 0, 0);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;

      case 'rect':
        if (snapshot) ctx.putImageData(snapshot, 0, 0);
        ctx.strokeStyle = color;
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
        break;

      case 'circle':
        if (snapshot) ctx.putImageData(snapshot, 0, 0);
        ctx.strokeStyle = color;
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setSnapshot(null);
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    const getPixel = (x: number, y: number) => {
      const i = (y * width + x) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    };

    const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    };

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const targetColor = getPixel(startX, startY);
    const [fillR, fillG, fillB] = hexToRgb(fillColor);

    if (targetColor[0] === fillR && targetColor[1] === fillG && targetColor[2] === fillB) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<number>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited.has(key)) continue;
      visited.add(key);

      const pixel = getPixel(x, y);
      if (Math.abs(pixel[0] - targetColor[0]) > 10 ||
          Math.abs(pixel[1] - targetColor[1]) > 10 ||
          Math.abs(pixel[2] - targetColor[2]) > 10) continue;

      setPixel(x, y, fillR, fillG, fillB);

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);

      if (visited.size > 500000) break;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `dibujo-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const ToolButton: React.FC<{
    id: Tool;
    icon: React.ReactNode;
    label: string;
  }> = ({ id, icon, label }) => (
    <button
      onClick={() => setTool(id)}
      className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${
        tool === id 
          ? 'bg-blue-500 text-white' 
          : 'text-gray-300 hover:bg-white/10'
      }`}
      title={label}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e]">
      {/* Toolbar */}
      <div className="h-auto bg-[#252535] border-b border-white/5 p-2">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Tools */}
          <div className="flex gap-1">
            <ToolButton id="brush" icon={<Pencil className="w-5 h-5" />} label="Pincel" />
            <ToolButton id="eraser" icon={<Eraser className="w-5 h-5" />} label="Borrador" />
            <ToolButton id="line" icon={<Minus className="w-5 h-5" />} label="Línea" />
            <ToolButton id="rect" icon={<Square className="w-5 h-5" />} label="Rect" />
            <ToolButton id="circle" icon={<CircleIcon className="w-5 h-5" />} label="Círculo" />
            <ToolButton id="fill" icon={<PaintBucket className="w-5 h-5" />} label="Rellenar" />
          </div>

          <div className="w-px h-10 bg-white/10" />

          {/* Color picker */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <div className="grid grid-cols-5 gap-1">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-10 bg-white/10" />

          {/* Brush size */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Grosor:</span>
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-xs text-gray-400 w-6">{brushSize}</span>
          </div>

          <div className="w-px h-10 bg-white/10" />

          {/* Actions */}
          <div className="flex gap-1">
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg text-gray-300 hover:bg-white/10 flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-xs">Limpiar</span>
            </button>
            <button
              onClick={downloadImage}
              className="p-2 rounded-lg text-gray-300 hover:bg-white/10 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs">Guardar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-[#2a2a3a] flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bg-white shadow-lg cursor-crosshair"
        />
      </div>
    </div>
  );
};
