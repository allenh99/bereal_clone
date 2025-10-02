import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CameraService } from '../src/services/CameraService';
import { useAuth } from '../src/services/context/AuthContext';
import { PermissionsService } from '../src/services/PermissionsService';
import { useRouter } from 'expo-router';

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('front');
  const [frontBase64, setFrontBase64] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    PermissionsService.can('capture', user).then(setAllowed);
  }, [user]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
      const lateSeconds = elapsed <= 120 ? 0 : elapsed - 120;
      const cam = cameraRef.current as any;
      if (!cam) return;
      // Two-step flow: capture front first, then back
      if (!frontBase64) {
        // Step 1: Front
        const front = await cam.takePictureAsync({ base64: true, quality: 0.9 });
        setFrontBase64(front.base64);
        setFacing('back');
        await sleep(300);
      } else {
        // Step 2: Back, then save pair
        const back = await cam.takePictureAsync({ base64: true, quality: 0.9 });
        await CameraService.savePair(back.base64, frontBase64, lateSeconds);
        setCompleted(true);
        // Navigate back to timeline so it refreshes via focus effect
        setTimeout(() => router.replace('/'), 500);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  if (!loading && !user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Please log in</Text>
        <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: 12 }}><Text style={{ color: '#007aff' }}>Go to Login</Text></TouchableOpacity>
      </View>
    );
  }

  if (!allowed) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text>You do not have permission to capture.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ textAlign: 'center', marginBottom: 8, fontWeight: '600' }}>Time left: {secondsLeft}s</Text>
      <Text style={{ textAlign: 'center', marginBottom: 8, color: '#666' }}>
        {!frontBase64 ? 'Step 1 of 2: Take your front photo' : 'Step 2 of 2: Take your back photo'}
      </Text>
      <View style={{ flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
        <CameraView ref={cameraRef as any} style={{ flex: 1 }} facing={facing} />
      </View>
      <TouchableOpacity onPress={handleCapture} disabled={isCapturing} style={{ marginTop: 12, backgroundColor: '#111', padding: 14, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          {isCapturing ? 'Capturing…' : (!frontBase64 ? 'Capture Front' : 'Capture Back')}
        </Text>
      </TouchableOpacity>
      {completed && <Text style={{ textAlign: 'center', marginTop: 8 }}>Saved!</Text>}
    </View>
  );
}


