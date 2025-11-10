import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const ConwayGameOfLife = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [generation, setGeneration] = useState(0);
  const animationRef = useRef<number>();
  const gridRef = useRef<boolean[][]>([]);
  
  const CELL_SIZE = 8;
  const GRID_WIDTH = 80;
  const GRID_HEIGHT = 50;

  const initializeGrid = () => {
    const grid: boolean[][] = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
      grid[i] = [];
      for (let j = 0; j < GRID_WIDTH; j++) {
        // Random initialization with 30% chance of being alive
        grid[i][j] = Math.random() < 0.3;
      }
    }
    return grid;
  };

  const countNeighbors = (grid: boolean[][], x: number, y: number): number => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newX = (x + i + GRID_HEIGHT) % GRID_HEIGHT;
        const newY = (y + j + GRID_WIDTH) % GRID_WIDTH;
        if (grid[newX][newY]) count++;
      }
    }
    return count;
  };

  const updateGrid = (grid: boolean[][]): boolean[][] => {
    const newGrid: boolean[][] = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
      newGrid[i] = [];
      for (let j = 0; j < GRID_WIDTH; j++) {
        const neighbors = countNeighbors(grid, i, j);
        if (grid[i][j]) {
          // Cell is alive
          newGrid[i][j] = neighbors === 2 || neighbors === 3;
        } else {
          // Cell is dead
          newGrid[i][j] = neighbors === 3;
        }
      }
    }
    return newGrid;
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, grid: boolean[][]) => {
    // Clear canvas
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

    // Draw cells
    for (let i = 0; i < GRID_HEIGHT; i++) {
      for (let j = 0; j < GRID_WIDTH; j++) {
        if (grid[i][j]) {
          ctx.fillStyle = 'hsl(var(--primary))';
          ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }
  };

  const animate = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    gridRef.current = updateGrid(gridRef.current);
    drawGrid(ctx, gridRef.current);
    setGeneration(prev => prev + 1);

    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Initialize grid
    gridRef.current = initializeGrid();
    drawGrid(ctx, gridRef.current);
    setGeneration(0);
  }, []);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  const handleReset = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    gridRef.current = initializeGrid();
    drawGrid(ctx, gridRef.current);
    setGeneration(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card border border-border rounded-lg">
      <canvas
        ref={canvasRef}
        width={GRID_WIDTH * CELL_SIZE}
        height={GRID_HEIGHT * CELL_SIZE}
        className="border border-border rounded"
      />
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <span className="text-sm text-muted-foreground font-mono">
          Generation: {generation}
        </span>
      </div>
    </div>
  );
};

export default ConwayGameOfLife;
