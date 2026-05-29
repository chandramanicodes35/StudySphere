import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, SkipForward, Music } from 'lucide-react';

const TRACKS = [
  {
    name: 'Cozy Lofi Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'Chillhop',
  },
  {
    name: 'Rainy Day Cafe',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'Ambient ASMR',
  },
  {
    name: 'Deep Space Focus',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    genre: 'Binaural Synth',
  },
  {
    name: 'Tranquil Forest Stream',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    genre: 'Nature Sounds',
  },
];

const MusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);

  const audioRef = useRef(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // React to volume adjustments
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // React to track index modifications
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.log('Playback halted by browser permissions.', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex]);

  // Handle click play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Audio stream play error:', err);
          alert('Could not start track. Please select another ambient stream.');
        });
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden group">
      {/* Invisible HTML5 Audio backer */}
      <audio ref={audioRef} loop />

      {/* Decorative backdrop glow */}
      <div className="absolute -left-12 -top-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all"></div>

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">{currentTrack.name}</h4>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{currentTrack.genre}</span>
          </div>
        </div>

        {/* Audio Equalizer animation bars */}
        {isPlaying && (
          <div className="flex items-end h-5 gap-[2px]">
            <span className="eq-bar"></span>
            <span className="eq-bar"></span>
            <span className="eq-bar"></span>
            <span className="eq-bar"></span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 mt-1 z-10">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-xl bg-dark-700/60 border border-slate-700/50 hover:bg-dark-600/70 text-slate-300 flex items-center justify-center active:scale-95 transition-transform"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 flex-1 max-w-[140px]">
          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
