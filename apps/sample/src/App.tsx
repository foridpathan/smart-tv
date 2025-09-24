import { AppProvider, Route, RouterProvider } from '@smart-tv/ui';
import HomePage from './components/HomePage';
import Layout from './components/Layout';

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
            <Route path="/" component={HomePage} />
            <Route path="/about" component={() => <div>About Page</div>} />
          </Layout>
        </RouterProvider>
      </AppProvider>
    </div>
  );
}

export default App;
