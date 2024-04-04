// src/components/MusicPlayerSlider.tsx

'use client'
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FastForwardRounded from '@mui/icons-material/FastForwardRounded';
import FastRewindRounded from '@mui/icons-material/FastRewindRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded';
import { songs } from '@/api';


const Widget = styled('div')(({ theme }) => ({
  padding: 16,
  borderRadius: 16,
  width: 360,
  maxWidth: '100%',
  margin: 'auto',
  position: 'relative',
  zIndex: 1,
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)',
  backdropFilter: 'blur(40px)',
  display: 'flex',
  flexDirection: 'column',
  gap: '3px'
}));

const CoverImage = styled('div')({
  objectFit: 'cover',
  overflow: 'hidden',
  flexShrink: 0,
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& > img': {
    width: '100%',
  },
});

const TinyText = styled('p')({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

export default function MusicPlayerSlider() {
  const ref = React.useRef<HTMLAudioElement>();
  const [songIndex, setSongIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [durations, setDurations] = React.useState<number[]>(Array(songs.length).fill(0));
  const [percentage, setPercentage] = React.useState(0);

  const handleControl = () => {
    if (paused) {
      ref.current?.play();
      setPaused(false);
    } else {
      ref.current?.pause();
      setPaused(true);
    }
  };

  const handlePrev = () => {
    setSongIndex(prevIndex => (prevIndex === 0 ? songs.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setSongIndex(prevIndex => (prevIndex + 1) % songs.length);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = ref.current;
    const newPosition = Number(e.target.value);
    audio!.currentTime = (audio!.duration / 100) * newPosition;
    setPercentage(newPosition);
  };

  const formatDuration = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getCurrentTime = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.target as HTMLAudioElement;
    setCurrentTime(audio.currentTime);
    setPercentage((audio.currentTime / audio.duration) * 100);
  };

  return (
    <div className=' h-screen w-full flex justify-center items-center bg-slate-200'>
      <Widget className=' shadow-md'>
        <div className=' flex justify-between items-center flex-col'>
          <CoverImage className=' h-[250px] w-[100%] rounded-2xl'>
            <img
              className=' h-full w-full rounded-2xl object-cover'
              alt={songs[songIndex].title}
              src={songs[songIndex].image}
            />
          </CoverImage>
          <div className=' ml-1 min-w-0 gap-y-2 flex flex-col w-full py-3'>
            <p className=' font-medium text-[12px]'>
              {songs[songIndex].album}
            </p>
            <div className=' flex  justify-between items-center'>
              <p className=' text-nowrap  text-[18px]'>
                <b>{songs[songIndex].title}</b>
              </p>
              <p className=' text-nowrap tracking-tight text-[12px] text-slate-600'>
                {songs[songIndex].artist}
              </p>
            </div>
          </div>
        </div>
        <Slider
          aria-label="time-indicator"
          size="small"
          value={percentage}
          valueLabelFormat={(value) => formatDuration((value * durations[songIndex]) / 100)}
          valueLabelDisplay='auto'
          min={0}
          max={100}
          onChange={onChange}
          sx={{
            height: 4,
            '& .MuiSlider-thumb': {
              width: 8,
              height: 8,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&::before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible': {
              },
              '&.Mui-active': {
                width: 20,
                height: 20,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.28,
            },
          }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 0,
          }}
        >
          <TinyText>{formatDuration(currentTime)}</TinyText>
          <TinyText>{formatDuration(durations[songIndex])}</TinyText>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: -3,
          }}
        >
          <IconButton aria-label="previous song" onClick={handlePrev}>
            <FastRewindRounded fontSize="large" />
          </IconButton>
          <IconButton
            aria-label={paused ? 'play' : 'pause'}
            onClick={handleControl}
          >
            {paused ? (
              <PlayArrowRounded fontSize="large" />
            ) : (
              <PauseRounded fontSize="large" />
            )}
          </IconButton>
          <IconButton aria-label="next song" onClick={handleNext}>
            <FastForwardRounded fontSize="large" />
          </IconButton>
        </Box>
      </Widget>
      {songs.map((song, index) => (
        <audio
          key={index}
          preload="metadata"
          src={song.songUrl}
          onLoadedMetadata={(e) => {
            const newDurations = [...durations];
            newDurations[index] = e.currentTarget.duration;
            setDurations(newDurations);
          }}
          onTimeUpdate={getCurrentTime}
          ref={index === songIndex ? ref : undefined}
        />
      ))}
    </div>
  );
}
