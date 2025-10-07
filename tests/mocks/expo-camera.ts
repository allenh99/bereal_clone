import React from 'react';
import { View } from 'react-native';
export const CameraView = React.forwardRef<any, any>((props, ref) => <View ref={ref} {...props} />);
export function useCameraPermissions() {
  return [{ granted: true }, jest.fn()];
}

module.exports = { CameraView, useCameraPermissions };


