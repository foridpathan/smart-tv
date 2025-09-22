import { Link } from '@smart-tv/ui/core/Router';
import React from 'react';

export default function Home() {
  return (
    <>
      <h1>Home</h1>

      <Link to="/movie">Go to Movie</Link>
    </>
  );
}
