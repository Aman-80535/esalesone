'use client';

import { useLoader } from '@/context/LoaderContext';
import Loader from './Loader';

export default function GlobalLoader() {
  const { loading } = useLoader();
  if (!loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(2px)',
      }}
    >
      <Loader />
    </div>
  );
}
