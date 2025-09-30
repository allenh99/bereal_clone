import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CameraService } from '../src/services/CameraService';

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    if (startedAt === null) setStartedAt(Date.now());
    return () => clearInterval(t);
  }, [startedAt]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
      const lateSeconds = elapsed <= 120 ? 0 : elapsed - 120;
      const cam = cameraRef.current as any;
      if (!cam) return;
      // Capture both first, then save as a pair so nothing is written until both exist
      const back = await cam.takePictureAsync({ base64: true, quality: 0.9 });
      setFacing('front');
      await sleep(400);
      const front = await cam.takePictureAsync({ base64: true, quality: 0.9 });
      await CameraService.savePair(back.base64, front.base64, lateSeconds);
      setCompleted(true);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ textAlign: 'center', marginBottom: 8, fontWeight: '600' }}>Time left: {secondsLeft}s</Text>
      <View style={{ flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
        <CameraView ref={cameraRef as any} style={{ flex: 1 }} facing={facing} />
      </View>
      <TouchableOpacity onPress={handleCapture} disabled={isCapturing} style={{ marginTop: 12, backgroundColor: '#111', padding: 14, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{isCapturing ? 'Capturing…' : 'Capture'}</Text>
      </TouchableOpacity>
      {completed && <Text style={{ textAlign: 'center', marginTop: 8 }}>Saved!</Text>}
    </View>
  );
}


