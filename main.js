export const createDebouncer = (ms = 16) => {
  let cancelDebounce = Function.prototype;

  return (callback) => {
    if (cancelDebounce !== Function.prototype) {
      return cancelDebounce;
    }

    const timeout = setTimeout(() => {
      cancelDebounce = Function.prototype;
      callback();
    }, ms);

    cancelDebounce = () => {
      clearTimeout(timeout);
    };

    return cancelDebounce;
  }
}

export default class State {
  constructor(
    state = {},
    onStateChange = Function.prototype,
    debouncer = createDebouncer()
  ) {
    this.initialState = state;
    this.state = Object.assign({}, state);

    this.onStateChange = onStateChange;
    this.cancelDebounce = Function.prototype;
    this.debounce = debouncer;
  }

  get() {
    return this.state;
  }

  update(functionOrStateObject) {
    let newState = {};

    if (typeof functionOrStateObject === 'function') {
      newState = functionOrStateObject(this.state);
    } else {
      newState = functionOrStateObject;
    }
    this.state = Object.assign({}, this.state, newState);

    this.emit();
  }

  emit() {
    this.cancelDebounce = this.debounce(() => {
      this.onStateChange(this.state);
    });
  }

  reset(state = {}) {
    this.state = Object.assign({}, this.initialState, state);
    this.emit();
  }

  destroy() {
    this.cancelDebounce();
    this.state = null;
  }
}
