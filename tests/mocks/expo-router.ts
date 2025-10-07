import React from 'react';
export function useRouter() {
  return { push: jest.fn(), replace: jest.fn(), back: jest.fn() } as any;
}
export const Stack: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
export const Link: React.FC<any> = ({ children }) => <>{children}</>;

module.exports = { useRouter, Stack, Link };


