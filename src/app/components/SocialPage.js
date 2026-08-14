'use client';

import React from 'react';
import { FaInstagram, FaFacebookF, FaTwitter, FaPinterestP } from 'react-icons/fa';

export default function SocialPage() {
  return (
    <div className="bg-[#0b382d] rounded-3xl p-8 md:p-12 text-white my-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="text-center md:text-left space-y-2">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
          #ShopiCommunity
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          Follow Our Fashion Journey
        </h2>
        <p className="text-xs text-emerald-100/80 max-w-md leading-relaxed">
          Tag @ShopiStore in your favorite looks for a chance to be featured in our seasonal lookbook.
        </p>
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-4">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white text-lg transition-all duration-300 transform hover:-translate-y-1"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>

        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white text-lg transition-all duration-300 transform hover:-translate-y-1"
          aria-label="Facebook"
        >
          <FaFacebookF />
        </a>

        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white text-lg transition-all duration-300 transform hover:-translate-y-1"
          aria-label="Twitter"
        >
          <FaTwitter />
        </a>

        <a
          href="https://pinterest.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white text-lg transition-all duration-300 transform hover:-translate-y-1"
          aria-label="Pinterest"
        >
          <FaPinterestP />
        </a>
      </div>
    </div>
  );
}