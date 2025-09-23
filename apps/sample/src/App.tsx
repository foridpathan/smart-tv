import { AppProvider, Route, RouterProvider } from '@smart-tv/ui';
import HomePage from './components/HomePage';
import Layout from './components/Layout';

function App() {
  return (
    <div className="tv-main">
      <AppProvider init={{}}>
        <RouterProvider>
          <Layout>
            <Route path="/" component={HomePage} />
          </Layout>
        </RouterProvider>
      </AppProvider>
    </div>
  );
}

export default App;
