import { AppProvider, Route, RouterProvider } from '@smart-tv/ui';
import HomePage from './components/HomePage';
import Layout from './components/Layout';
import Activity from './pages/Activity';
import Drama from './pages/Drama';
import Favorites from './pages/Favorites';
import Movies from './pages/Movies';
import Search from './pages/search';
import User from './pages/User';


const Menus = [
  {
    focusKey: 'SEARCH',
    component: Search,
    to: '/search',
    skippable: false,
  },
  {
    focusKey: 'HOME',
    component: HomePage,
    to: '/',
    skippable: false,
  },
  {
    focusKey: 'MOVIES',
    component: Movies,
    to: '/movies',
    skippable: true,
  },
  {
    focusKey: 'DRAMA',
    component: Drama,
    to: '/drama',
    skippable: false,
  },
  {
    focusKey: 'ACTIVITY',
    component: Activity,
    to: '/activity',
    skippable: true,
  },
  {
    focusKey: 'FAVORITES',
    component: Favorites,
    to: '/favorites',
    skippable: true,
  },
  {
    focusKey: 'User',
    component: User,
    to: '/account',
    skippable: true,
  },
]

function App() {
  return (
    <div className="tv-main h-screen w-screen bg-gradient-to-b from-[#061022] via-[#0b1730] to-[#04101a]">
      <AppProvider init={{
        debug: false,
        visualDebug: false,
        distanceCalculationMethod: 'center',
      }} >
        <RouterProvider>
          <Layout>
            {
              Menus.map((menu) => (
                <Route key={menu.focusKey} path={menu.to} component={menu.component} skippable={menu.skippable} />
              ))
            }
          </Layout>
        </RouterProvider>
      </AppProvider>
    </div>
  );
}

export default App;
