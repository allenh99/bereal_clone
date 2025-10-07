import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import { AuthProvider } from '../../src/services/context/AuthContext';

export function render(ui: React.ReactNode) {
  return rtlRender(<AuthProvider>{ui}</AuthProvider>);
}


