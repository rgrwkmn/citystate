## Usage

### cjs

Here is how require citystate in commonjs code. The rest of the documentation is shown using es6 modules.

```javascript
const citystate = require('citystate');
const State = citystate.default;
const createDebouncer = citystate.createDebouncer;
const myFirstState = new State({});
```

### Creating state, updating state, and handling changes
```javascript
import State from 'citystate';

const changeHandler = (state) => {
  console.log(state.hello);
};

const myFirstState = new State({ hello: 'hola' }, changeHandler);
// nothing happens in the console
// changeHandler is only called on update

myFirstState.update({ hello: 'buenos dias' });
// > "buenos dias"
```

### Getting state
```javascript
import State from 'citystate';
const myFirstState = new State({ hello: 'hola' });
const currentState = myFirstState.get();
console.log(currentState);
// > { hello: "hola" }
```

### Destroying state

Calling the `destroy` method will cancel any debounces and null out the stored state.

Use it when your state is no longer going to be needed, such as if you are storing state for a client that disconnects from your server, or a component that is unmounted from a page.

```javascript
import State from 'citystate';
const myFirstState = new State({ hello: 'hola' }, console.log);

myFirstState.update({ hello: 'buenos dias' });
myFirstState.destroy();
// there will be no console.log from the update because the debounce is cancelled
console.log(myFirstState.get());
// > null
```

### Debounce
The changeHandler is debounced 16ms by default so rapid updates do not call the changeHandler until at least 16ms have passed from the first update.

```javascript
import State from 'citystate';
const myFirstState = new State({ hello: 'hola' }, console.log);

myFirstState.update({ hello: 'buenos dias' });
myFirstState.update({ hello: 'buenas tardes' });
myFirstState.update({ hello: 'buenas noches' });
// ~16ms later...
// > { hello: "buenas noches" }
```

#### Custom debounce time

Set the amount of milliseconds to debounce by passing a number argument to `createDebouncer` as the third argument to the State constructor.

```javascript
import State, { createDebouncer } from 'citystate';
const myFirstState = new State(
  { hello: 'hola' },
  console.log,
  createDebouncer(100)
);
```

#### Custom debouncer

A debouncer must be a function that accepts a callback function argument, and returns a function that will cancel the debounce.

Obviously it should call the callback function eventually, based on the strategy.

Here is an example using `requestAnimationFrame` as the debounce method, while keeping the same debounce strategy as the default.

```javascript
import State from 'citystate';

const requestAnimationFrameDebouncerFactory = () => {
  // this is a factory so that we can store this
  // cancelDebounce function as local state
  let cancelDebounce = Function.prototype;

  return (callback) => {
    if (cancelDebounce !== Function.prototype) {
      // there is already a scheduled callback
      // return the existing cancel method
      return cancelDebounce;
    }

    // there is a state change and no scheduled callback
    // so schedule execution
    const requestId = requestAnimationFrame(() => {
      // execution time has come
      // now we can reset the cancel method
      // so that next time state is updated
      // it will schedule the callback
      cancelDebounce = Function.prototype;
      // and finally execute the callback
      // the change handler will be executed with the latest state
      callback();
    });

    // store the cancel method
    cancelDebounce = () => {
      cancelAnimationFrame(requestId);
    };

    // return the cancel method
    return cancelDebounce;
  }
}

const myFirstState = new State(
  { hello: 'hola' },
  console.log,
  requestAnimationFrameDebouncerFactory()
);
```

##### Why does the debouncer do so much?

The main State class could keep track of the debounce state, simplifying your custom debounce function, but also committing you to the same strategy as the default debouncer.

Instead, it leaves the strategy to the debouncer. For example, you may want to immediately call the callback if there have been no updates for 16ms, instead of guaranteeing that you wait 16ms.
