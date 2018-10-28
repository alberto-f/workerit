# Workerit
**Workerit** tries to simplify the way the write code for Web Workers. No need to create a specific file for it anymore. 

With **workerit**, you only need to create a workerit instance and install any function you want on it.
Workerit will only start running your function into a Worker once the first message is sent.

Check the **Usage** section for more information.


_workerit only supports browser environments since it uses [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)._

## Getting Started

WIP

```
npm install --save workerit
```

## Usage

```js
/*
 * workerit wraps Web Worker and add an extra method .install(Function).
 */
const workerit = new window.Workerit()

/*
 * Listen worker messages
 */
workerit.addEventListener('message', function (evt) {
  console.log('Message = ' + evt.data)
})

/*
 * Install a function into the worker.
 */
workerit.install(function (scope, event) {
  let res = 0
  for (let i = 0; i <= event.data; i++) {
    for (let j = 0; j <= event.data; j++) { res += i }
  }

  /*
   * Lets sent the result back.
   */
  scope.postMessage(res)
})

/*
 * As with Workers, first message will start the Worker.
 */
workerit.postMessage(5000)

```

# Release History

