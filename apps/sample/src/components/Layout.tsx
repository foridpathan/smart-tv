import { Link } from '@smart-tv/ui';
import { ReactNode } from 'react';

export default function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <header className="bg-gray-800 text-white p-4 w-48">
        <div className="flex flex-col items-center justify-between">
          <div className="font-bold">My TV App</div>
          <nav className="flex flex-col gap-3">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </div>
      </header>

      <main className='flex-1'>{children}</main>
    </div>
  );
}
