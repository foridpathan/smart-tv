
import { AppContextProvider, Route, RouterProvider } from '@smart-tv/ui';
import React from 'react';
import Home from './home';
import Movie from './movie';
import WebSeries from './webSeries';

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
