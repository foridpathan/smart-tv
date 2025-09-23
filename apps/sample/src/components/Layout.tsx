import { Link, Menu, Sidebar } from '@smart-tv/ui';
import { ReactNode } from 'react';

export default function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar collapsedWidth={50}>
        {({ focused }) => (
          <>
            <div className="font-bold">My TV App</div>
            <nav className="flex flex-col gap-3">
              <Menu focusKey='Home' focus href='/' className='bg-orange-500 text-white rounded-lg px-4 py-2' active='bg-orange-900' onEnterPress={(e) => console.log(e)}>
                <span>🏠</span>
                {
                  focused &&
                  <span>Home</span>
                }
              </Menu>
              <Menu focusKey='About' href='/about' className='bg-orange-500 text-white rounded-lg px-4 py-2' active='bg-orange-900'>About </Menu>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
            </nav>
          </>
        )}
      </Sidebar>

      <main className='flex-1'>{children}</main>
    </div>
  );
}
