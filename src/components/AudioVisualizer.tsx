import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

interface AudioVisualizerProps {
  audioSrc: string;
}

const AudioVisualizer = ({ audioSrc }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = 150; // Fixed height for better visibility
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const setupAudio = () => {
      if (audioContextRef.current) return;

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 128; // Smaller for more dramatic bars
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        draw();
      } catch (err) {
        console.error('Error setting up audio:', err);
      }
    };

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current || !ctx) return;

      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)'); // green
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.9)'); // blue
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.9)'); // purple

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const barHeight = (dataArrayRef.current[i] / 255) * canvas.height;

        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
          x,
          canvas.height - barHeight,
          barWidth - 2,
          barHeight
        );

        ctx.shadowBlur = 0;
        x += barWidth;
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setShowPrompt(false);
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadeddata', () => {
      console.log('Audio loaded successfully');
    });
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        if (!audioContextRef.current) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaElementSource(audio);
          const analyser = audioContext.createAnalyser();
          
          analyser.fftSize = 128;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          source.connect(analyser);
          analyser.connect(audioContext.destination);

          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
          dataArrayRef.current = dataArray;

          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (ctx && canvas) {
            const draw = () => {
              if (!analyserRef.current || !dataArrayRef.current) return;
              animationRef.current = requestAnimationFrame(draw);
              analyserRef.current.getByteFrequencyData(dataArrayRef.current);

              const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
              gradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)');
              gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.9)');
              gradient.addColorStop(1, 'rgba(168, 85, 247, 0.9)');

              ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
              let x = 0;

              for (let i = 0; i < dataArrayRef.current.length; i++) {
                const barHeight = (dataArrayRef.current[i] / 255) * canvas.height;
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
                ctx.shadowBlur = 0;
                x += barWidth;
              }
            };
            draw();
          }
        }
      } else {
        audio.pause();
      }
    } catch (err) {
      console.error('Error toggling audio:', err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/95 to-transparent">
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="auto"
        className="hidden"
      />
      
      {/* Prompt to enable audio */}
      {showPrompt && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg animate-pulse">
          <p className="text-sm font-semibold">Click to enable audio 🎵</p>
        </div>
      )}

      {/* Control button */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={toggleAudio}
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg"
        >
          {isPlaying ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Visualization */}
      <canvas
        ref={canvasRef}
        className="w-full h-[150px] cursor-pointer"
        onClick={toggleAudio}
      />
    </div>
  );
};

export default AudioVisualizer;
