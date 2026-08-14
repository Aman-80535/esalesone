'use client';

import React from 'react';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[160px] gap-3">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-emerald-900 animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;