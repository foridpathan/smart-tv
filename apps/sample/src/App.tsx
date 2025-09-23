import { AppProvider, Route, RouterProvider } from '@smart-tv/ui';
import HomePage from './components/HomePage';

function App() {
  return (
    <div className="tv-main">
      <AppProvider init={{ debug: true, visualDebug: true }}>
        <RouterProvider>
          <Route path="/" component={HomePage} />
        </RouterProvider>
      </AppProvider>
    </div>
  );
}

export default App;
