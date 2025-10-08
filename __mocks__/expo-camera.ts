const React = require('react');
const { forwardRef, useImperativeHandle } = React;
const { View } = require('react-native');

const pictureQueue = [] as any[];
const __requestPermissionMock = jest.fn(async () => ({ granted: true }));

function __queuePicture(base64: string) {
	pictureQueue.push({ ok: base64 });
}

function __queuePictureError(message = 'capture failed') {
	pictureQueue.push({ error: new Error(message) });
}

function __resetCameraMock() {
	__requestPermissionMock.mockClear();
	pictureQueue.length = 0;
}

const CameraView = forwardRef((props: any, ref: any) => {
	useImperativeHandle(ref, () => ({
		takePictureAsync: async (_opts?: any) => {
			const next: any = pictureQueue.shift() || { ok: 'BASE64DATA' };
			if (next && next.error) throw next.error;
			return { base64: next.ok };
		},
	}));
	return React.createElement(View, { testID: 'camera-view', style: (props || {}).style });
});

function useCameraPermissions() {
	return [{ granted: true }, __requestPermissionMock];
}

module.exports = {
	CameraView,
	useCameraPermissions,
	__requestPermissionMock,
	__queuePicture,
	__queuePictureError,
	__resetCameraMock,
};


