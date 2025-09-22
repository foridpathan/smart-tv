
import { AppProvider, Route, RouterProvider } from '@smart-tv/ui/core';
import React from 'react';
import Home from './home';
import Movie from './movie';
import WebSeries from './webSeries';

function App() {
  return (
    <>
      <AppProvider init={{debug: true, visualDebug: true}}>
        <RouterProvider>
          <Route path="/" component={Home} />
          <Route path="/movie" component={Movie} />
          <Route path="/web-series" component={WebSeries} />
        </RouterProvider>
      </AppProvider>
    </>
  );
}

export default App;
