
import { AppContextProvider } from '@smart-tv/ui/AppContext';
import { Route, RouterProvider } from '@smart-tv/ui/Router';
import React from 'react';
import Home from './home';

const Movie: React.FC = () => <div>Movie</div>;
const WebSeries: React.FC = () => <div>Web Series</div>;

function App() {
  return (
    <AppContextProvider init={{ debug: true, visualDebug: true }}>
      <RouterProvider>
        <Route path="/" component={Home} />
        <Route path="/movie" component={Movie} />
        <Route path="/web-series" component={WebSeries} />
      </RouterProvider>
    </AppContextProvider>
  );
}

export default App;
