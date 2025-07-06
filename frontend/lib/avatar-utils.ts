'use client';

import { createAvatar } from '@dicebear/core';
import { avataaars, initials, lorelei, personas } from '@dicebear/collection';

export function generateAvatar(username: string, style: 'avataaars' | 'initials' | 'lorelei' | 'personas' = 'avataaars'): string {
  try {
    let collection;
    let options: any = {
      seed: username,
      size: 128,
    };

    switch (style) {
      case 'avataaars':
        collection = avataaars;
        break;
      case 'initials':
        collection = initials;
        options.chars = 2;
        break;
      case 'lorelei':
        collection = lorelei;
        break;
      case 'personas':
        collection = personas;
        break;
      default:
        collection = avataaars;
    }

    const avatar = createAvatar(collection, options);
    return avatar.toDataUri();
  } catch (error) {
    console.error('Error generating avatar:', error);
    // Fallback to a simple gradient avatar
    return generateGradientAvatar(username);
  }
}

export function generateGradientAvatar(username: string): string {
  const colors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a8edea', '#fed6e3'],
    ['#ffecd2', '#fcb69f'],
    ['#ff8a80', '#ff80ab'],
  ];

  const hash = username.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  const colorIndex = Math.abs(hash) % colors.length;
  const [color1, color2] = colors[colorIndex];

  const initials = username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const svg = `
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" fill="url(#grad)" />
      <text x="64" y="80" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const avatarStyles = [
  { key: 'avataaars', name: 'Avataaars', description: 'Cartoon-style avatars' },
  { key: 'initials', name: 'Initials', description: 'Simple initials with colors' },
  { key: 'lorelei', name: 'Lorelei', description: 'Pixel art style' },
  { key: 'personas', name: 'Personas', description: 'Abstract geometric shapes' },
] as const;
