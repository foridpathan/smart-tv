import { AppProvider, Route, RouterProvider } from '@smart-tv/ui';
import HomePage from './components/HomePage';
import Layout from './components/Layout';

function App() {
  return (
    <div className="tv-main">
      <AppProvider init={{
        debug: false,
        visualDebug: false,
        distanceCalculationMethod: 'center',
      }}>
        <RouterProvider>
          <Layout>
            <Route path="/" component={HomePage} />
            <Route path="/about" component={() => <div>About Page</div>} />
          </Layout>
        </RouterProvider>
      </AppProvider>
    </div>
  );
}

export default App;
