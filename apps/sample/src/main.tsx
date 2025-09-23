import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// Initialize for old Smart TV compatibility
if (!window.Promise) {
  // Simple Promise polyfill for very old browsers
  window.Promise = class Promise {
    constructor(executor) {
      let self = this;
      self.state = 'pending';
      self.value = undefined;
      self.handlers = [];

      function resolve(result) {
        if (self.state === 'pending') {
          self.state = 'fulfilled';
          self.value = result;
          self.handlers.forEach(handle);
          self.handlers = null;
        }
      }

      function reject(error) {
        if (self.state === 'pending') {
          self.state = 'rejected';
          self.value = error;
          self.handlers.forEach(handle);
          self.handlers = null;
        }
      }

      function handle(handler) {
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

      this.then = function(onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
          handle({
            onFulfilled: function(result) {
              try {
                resolve(onFulfilled ? onFulfilled(result) : result);
              } catch (ex) {
                reject(ex);
              }
            },
            onRejected: function(error) {
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
    }
  };
}

// Array.from polyfill
if (!Array.from) {
  Array.from = function(arrayLike, mapFn, thisArg) {
    var result = [];
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
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootElement
  );
} else {
  console.error('Root element not found. Make sure there is a div with id="root" in your HTML.');
}
