'use client'

import { useLoader } from '@/context/LoaderContext';
import Loader from './Loader'; // Your existing loader

export default function GlobalLoader() {
  const { loading } = useLoader();
  console.log(loading, "loadingggg");
  return (
    <>
      {loading && (
        <div style={{
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
        }}>
          <Loader />
        </div>
      )}
    </>
  );
}
