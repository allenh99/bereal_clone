import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';

const pictureQueue: string[] = [];
const requestPermissionMock = jest.fn(async () => ({ granted: true }));

export function __queuePicture(base64: string) {
	pictureQueue.push(base64);
}

export function __resetCameraMock() {
	requestPermissionMock.mockClear();
	pictureQueue.length = 0;
}

export const CameraView = forwardRef<any, any>((props, ref) => {
	useImperativeHandle(ref, () => ({
		takePictureAsync: async (_opts?: any) => {
			const base64 = pictureQueue.shift() ?? 'BASE64DATA';
			return { base64 };
		},
	}));
	return <View testID="camera-view" style={props.style} />;
});

export function useCameraPermissions() {
	return [{ granted: true }, requestPermissionMock] as const;
}


