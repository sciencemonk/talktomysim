import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with proper dimensions
    const resizeCanvas = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      console.log('Canvas dimensions:', width, height);
      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const setupAudio = () => {
      if (audioContextRef.current) {
        console.log('AudioContext already exists, skipping setup');
        return;
      }

      console.log('Setting up AudioContext and analyser');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      console.log('AudioContext setup complete, starting draw loop');
      draw();
    };

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current || !ctx || !canvas) return;

      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(0.5, '#3b82f6');
      gradient.addColorStop(1, '#a855f7');

      // Clear canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArrayRef.current.length) * 3;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        // Use a minimum bar height to always show something
        const dataValue = dataArrayRef.current[i] || 5;
        const barHeight = Math.max(5, (dataValue / 255) * canvas.height);

        ctx.fillStyle = gradient;
        ctx.fillRect(
          x,
          canvas.height - barHeight,
          barWidth - 2,
          barHeight
        );

        x += barWidth;
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Auto-play with user interaction
    const startAudio = () => {
      console.log('Attempting to play audio from:', audioSrc);
      
      // Only setup audio context once
      if (!audioContextRef.current) {
        setupAudio();
      }
      
      audio.play().then(() => {
        console.log('Audio playing successfully');
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
      }).catch(err => {
        console.error('Audio play failed:', err);
      });
    };

    // Try to start immediately
    startAudio();

    // Also try on any user interaction
    const handleInteraction = () => {
      console.log('User interaction detected, starting audio');
      if (!isPlaying && audio.paused) {
        startAudio();
      }
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    // Also listen for audio errors
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      console.error('Failed to load audio from:', audioSrc);
      // Still show visualizer
      setupAudio();
    };
    
    audio.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioSrc]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-32 bg-black/20 backdrop-blur-sm">
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        crossOrigin="anonymous"
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

export default AudioVisualizer;
