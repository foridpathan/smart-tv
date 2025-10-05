import '@smart-tv/player/styles.css';
import '@smart-tv/ui/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize for old Smart TV compatibility
// Cast window to any for the assignment because the runtime polyfill
// doesn't include static methods like Promise.resolve/reject/all/race.
// We only need a minimal polyfill implementation for instances used
// by the app at runtime on very old Smart TVs.
if (!(window as any).Promise) {
  // Simple Promise polyfill for very old browsers
  // Use a locally-named constructor to avoid colliding with the
  // TypeScript global `Promise` type during typechecking.
  const SimplePromise: any = function (executor: any) {
    const self: any = this;
    self.state = 'pending';
    self.value = undefined;
    self.handlers = [] as any[];

    function resolve(result: any) {
      if (self.state === 'pending') {
        self.state = 'fulfilled';
        self.value = result;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function reject(error: any) {
      if (self.state === 'pending') {
        self.state = 'rejected';
        self.value = error;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function handle(handler: any) {
      if (self.state === 'pending') {
        self.handlers.push(handler);
      } else {
        if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
          handler.onFulfilled(self.value);
        }
        if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
          handler.onRejected(self.value);
        }
      }
    }

    this.then = function (onFulfilled: any, onRejected: any) {
      return new SimplePromise(function (resolve: any, reject: any) {
        handle({
          onFulfilled: function (result: any) {
            try {
              resolve(onFulfilled ? onFulfilled(result) : result);
            } catch (ex) {
              reject(ex);
            }
          },
          onRejected: function (error: any) {
            try {
              resolve(onRejected ? onRejected(error) : error);
            } catch (ex) {
              reject(ex);
            }
          }
        });
      });
    };

    try {
      executor(resolve, reject);
    } catch (ex) {
      reject(ex);
    }
  };

  (window as any).Promise = SimplePromise;
}

// Array.from polyfill
if (!(Array as any).from) {
  (Array as any).from = function (arrayLike: any, mapFn?: any, thisArg?: any) {
    var result: any[] = [];
    var length = parseInt(arrayLike.length) || 0;
    for (var i = 0; i < length; i++) {
      var value = arrayLike[i];
      if (mapFn) {
        value = mapFn.call(thisArg, value, i);
      }
      result.push(value);
    }
    return result;
  };
}

// Ensure root element exists before rendering
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found. Make sure there is a div with id="root" in your HTML.');
}
