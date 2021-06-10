const assert = require('assert');
const CityState = require('./index.js');
const State = CityState.default;
const createDebouncer = CityState.createDebouncer;

assert(typeof createDebouncer === 'function', 'createDebouncer function is exported');
console.log('createDebouncer function is exported');

let currentState = null;
const changeHandler = (state) => {
  if (state.reset) {
    // see testState.destroy() at the end of the tests below
    throw new Error('Change handler should have been cancelled!');
  }

  assert.equal(
    currentState, state, 'changeHandler is called with correct object'
  );
  console.log('changeHandler is called with correct object');

  assert.equal(
    currentState.test, state.test, 'changeHandler is called with same state'
  );
  console.log('changeHandler is called with same state');

  // in tests below, `state.test` is set to 2, then 3 immediately
  // the changehandler should be debounced and only called with test === 3
  assert.equal(
    state.test, 3, 'changeHandler is debounced'
  );
  console.log('changeHandler is debounced');
};

const testObject = { test: 1, other: 0 };
const testState = new State(testObject, changeHandler);
const initialState = testState.get();
currentState = initialState;

assert.equal(currentState.test, 1, 'State stores initial data');
console.log('State stores initial data');

assert.notEqual(testObject, currentState, 'State constructor assigns a new state object');
console.log('State constructor assigns a new state object');

testState.update({ test: 2 });
testState.update({ test: 3 });
currentState = testState.get();

assert.notEqual(initialState, currentState, 'State assigns update into new object');
console.log('State assigns update into new object');

assert.equal(initialState.other, currentState.other, 'State extends state on update');
console.log('State extends state on update');

assert.equal(currentState.test, 3, 'State updates');
console.log('State updates');

setTimeout(() => {
  // wait until after the changeHandler should have been called
  // so we can test reset and then that the debounce gets cancelled with the `destroy` method
  testState.reset({ reset: true });
  currentState = testState.get();

  assert.equal(currentState.test, 1, 'State resets to intial state');
  console.log('State resets to intial state');

  assert.equal(currentState.reset, true, 'State resets with extended data');
  console.log('State resets with extended data');

  // changeHandler should not be called if state is destroyed
  testState.destroy();

  assert.equal(testState.get(), null, 'state should be null after destroy');
  console.log('state should be null after destroy');
}, 20);
