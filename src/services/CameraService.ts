import { FileManagerService } from './FileManagerService';

export class CameraService {
  static async savePair(backBase64: string, frontBase64: string, lateSeconds: number = 0) {
    const backSaved = await FileManagerService.saveJpeg(backBase64, new Date(), 'back', lateSeconds);
    const frontSaved = await FileManagerService.saveJpeg(frontBase64, new Date(), 'front', lateSeconds, { dateKey: backSaved.dateKey, timeKey: backSaved.timeKey });
    return { back: backSaved, front: frontSaved };
  }
}


