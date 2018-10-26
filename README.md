# Workerit
**Workit** tries to simplify the way the write code for Web Workers. No need to create a specific file for it anymore. 

With **Workit**, you only need to create a Workit instance and install any function you want on it.
Workit will only start running your function into a Worker once the first message is sent.

Check the **Usage** section for more information.


_Workit only supports browser environments since it uses [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)._

## Getting Started

WIP

```
npm install --save workit
```

## Usage

```
/*
 * Workit wraps Web Worker and add an extra method .install(Function).
 */
const workit = new window.Workit()

/*
 * Listen worker messages
 */
workit.addEventListener('message', function (evt) {
  console.log('Message = ' + evt.data)
})

/*
 * Install a function into the worker.
 */
workit.install(function (scope, event) {
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
workit.postMessage(5000)

```

