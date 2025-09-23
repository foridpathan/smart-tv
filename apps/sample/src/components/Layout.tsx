import { Link } from '@smart-tv/ui';
import { ReactNode } from 'react';

export default function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="tv-layout" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <header className="tv-header" style={{padding: '12px 16px', background: '#081229', color: 'white'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontWeight: 700}}>My TV App</div>
          <nav style={{display: 'flex', gap: 12}}>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </div>
      </header>

      <main style={{flex: 1, padding: 16}}>{children}</main>

      <footer style={{padding: '8px 16px', background: '#0b1630', color: '#9fb0d6'}}>
        <div style={{fontSize: 13}}>© {new Date().getFullYear()} My TV App</div>
      </footer>
    </div>
  );
}
