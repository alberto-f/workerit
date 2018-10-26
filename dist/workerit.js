(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Workerit = factory());
}(this, (function () { 'use strict';

  /* globals Worker, Blob */

  /*
   *
   * Workit Class
   *
   */
  const STATES = {
    INIT: 'INIT',
    RUNNING: 'RUNNING',
    END: 'END'
  };

  function Workerit () {
    this._state = STATES.INIT;

    this._statesAllowed = Object.keys(STATES);
    this._listenersAllowed = ['message', 'messageerror', 'error'];

    this._listeners = {};
    this._listenersAllowed.forEach(name => {
      this._listeners[name] = [];
    });
  }

  Workerit.prototype._isAllowedState = function _isAllowedState (state) {
    return this._statesAllowed.some(stateAllowed => stateAllowed === state)
  };

  Workerit.prototype._setState = function _setState (state) {
    if (!this._isAllowedState(state)) {
      throw new Error('State ' + state + ' not allowed.')
    }

    this._state = state;
  };

  Workerit.prototype._isState = function _isState (state) {
    return this._state === state
  };

  Workerit.prototype.addEventListener = function addEventListener (eventName, cb) {
    if (this._listenersAllowed.some(name => name === eventName)) {
      this._listeners[eventName].push(cb);
    }
  };

  Workerit.prototype.removeEventListener = function removeEventListener (eventName, cb) {

  };

  Workerit.prototype.terminate = function terminate () {
    if (this._isState(STATES.RUNNING)) {
      this._worker.terminate();
    } else {
      throw new Error('Workerit is not running.')
    }
  };

  Workerit.prototype.install = function install (fn) {
    const script = this._createWorkerScript(fn);
    const scriptBlob = new Blob([script], { type: 'application/javascript' });
    const scriptUrl = URL.createObjectURL(scriptBlob);

    this._worker = new Worker(scriptUrl);
  };

  Workerit.prototype._registerListeners = function _updateListeners () {
    this._listenersAllowed.forEach(eventName => {
      this._listeners[eventName].forEach(listener => {
        // Remove prev listeners
        this._worker.removeEventListener(eventName, listener);

        // Register new listeners
        this._worker.addEventListener(eventName, listener);
      });

      // Any action that is triggered will move the worker state to END state
      this._worker.addEventListener(eventName, () => this._setState(STATES.END));
    });
  };

  Workerit.prototype.postMessage = function postMessage (data) {
    // Update listeners
    this._registerListeners();

    // Set state to RUNNING
    this._setState(STATES.RUNNING);

    // Start Worker
    this._worker.postMessage(data);
  };

  Workerit.prototype._createWorkerScript = function _createWorkerScript (fn) {
    return `const f = ${fn}; self.onmessage = (e) => f(self, e)`
  };

  return Workerit;

})));
