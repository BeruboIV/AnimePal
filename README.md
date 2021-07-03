# AnimePal

AnimePal is an open-source anime review web-app.

## Installation

Use the node package manager [npm](https://nodejs.org/en/) to install AnimePal.

```
git clone https://github.com/BeruboIV/AnimePal
cd AnimePal
npm install
node app.js
```

The app is hosted on PORT 3000

# Comment Section

This was the most difficult to implement and I faced a lot of issues while doing so.

## Issues faced:

-   ## ejs
    We cannot use ejs with _html attributes_ ([except](https://www.w3schools.com/html/html_forms_attributes.asp) for `action = " "`)

`<tag style = "<%= param.value %>"`
This syntax is not acceptable while

`<tag action = "/path/<%= param.value %>"`
is acceptable.

To create style tags whose values depend on the sub-level of a comment, I had to use **[string template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)** in the javascript file [routes/anime.js](https://github.com/BeruboIV/AnimePal/blob/9159cb647f134207ded9bbd3fe28f934544bd13b/routes/animes.js#L54)

### Note:

Use:

`<%- %>` for rendering HTML components as HTML in ejs

`<%= >` to render HTML as Plain Text

-   ## Event Delegation

Using _String Template Literals_ means we are providing **_dynamic_** data to HTML and to add event listeners to dynamic nodes, we have to use **Event Delegation**

### Note:

Don't use arrow function in event delegation as _**this**_ behaves differently and refers to the window instead of the node being clicked

-   ## Event Loop and Async/Await

    [animes.js](https://github.com/BeruboIV/AnimePal/blob/main/routes/animes.js)

    [comments.js](https://github.com/BeruboIV/AnimePal/blob/main/routes/comments.js)

At first I worte the recurisve version of DFS to display the nested comments. But I was getting the output as Level Order (BFS).

I wrote the code iterative code of DFS and this worked.

#### ROOT CAUSE ANALYSIS (RCA)

Firstly, the BFS like output was pure coincidence. This happended because

```javascript
const comment = await Comment.findById(parent_comment_id);
```

was taking the same amount of time for each call and so the _Promises_ were sent to the _Web APIs_ and then to the _Event Queue_ in BFS like order.

But in realtime applications, call to the databases may not take the same time for each call and in such a case, we would get en entirely different traversal for each user.

```javascript
for (let i = 0; i < 10; i++) setTimeout(() => console.log(i), 0);
/* The output will be
0
1
2
3
4
5
6
7
8
9
*/
/*
This is what was happening with me, all the calls were taking the same amount of time and hence the BFS like output.
*/
```

Now let's see what happens in real time:

```javascript
for (let i = 0; i < 10; i++)
    setTimeout(() => console.log(i), Math.floor(Math.random() * 5));
```

Each database call takes some random amount of time and then in the _same order_ they are put in the _Event Queue_.

To overcome this randomness, we use [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

> A `Promise` is a proxy for a value not necessarily known when the promise is created. It allows you to associate handlers with an asynchronous action's eventual success value or failure reason. This lets asynchronous methods return values like **synchronous methods**: instead of immediately returning the final value, the asynchronous method returns a promise to supply the value at some point in the future.

and Async/[Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)

> The `await` expression causes `async` function execution to pause until a `Promise` is settled (that is, fulfilled or rejected), and to resume execution of the `async` function after fulfillment. When resumed, the value of the `await` expression is that of the fulfilled `Promise`.

The same code can then be written as:

```javascript
async function databaseCall(x) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(x);
        }, Math.floor(Math.random() * 5));
    });
}

(async function () {
    for (let i = 0; i < 10; i++) {
        const res = await databaseCall(i);
        console.log(res); // i
    }
})();

//  The output will be:
/*
0
1
2
3
4
5
6
7
8
9
*/
```

The `const res = await databaseCall(x)` pauses the execution of the async function until a Promise is returned. The Promise for a particular function call is returned after a random amount of time and only then a new function call is made.

### Can we use `.forEach()` instead of `for` loop?

```javascript
async function databaseCall(x) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(x);
        }, Math.floor(Math.random() * 5));
    });
}

async function parent(){
    array.forEach(async function outer(ele, idx) => {
        await databaseCall(ele);
        .
        .
        .
    });
}
// async_function returns a Promise and until a Promiseid returned, the outer function will be on halt
```

The above syntax is wrong for using Async/Await because if `array.forEach()` is inside another function (async or not), it is the `databaseCall` function which will be on halt and not the `parent` function. This is very important!

What we want is:

```javascript
await databaseCall(1);
    ↓
await databaseCall(2);
    ↓
await databaseCall(3)
    ↓
.
.
.
    ↓
await databaseCall(N);
```

That is `fun3` be executed only after `func2` has been executed which on turn waits for `fun1` to be exuecuted before starting it's own execution.

```
databaseCall(1) → databaseCall(2) → databaseCall(3) → databaseCall(4) → ... → databaseCall(N)
```

The `for` loop method which I described above uses this logic only.

The Stack / Iterative version of DFS follows this procedure and hence gives the correct output.

**Problem with `.forEach()`** is that all the `outer` functions are executed **independently** of each other.

| `await databaseCall(1)` | `await databaseCall(2)` | `await databaseCall(3)` | `await databaseCall(4)` | `...` | `await databaseCall(N)` |
| ----------------------- | ----------------------- | ----------------------- | ----------------------- | ----- | ----------------------- |

This is exactly like as I mentioned above:

```javascript
for (let i = 0; i < 10; i++)
    setTimeout(() => console.log(i), Math.floor(Math.random() * 5));
```

### Solution:

Use normal `for` loop with `async/await` instead of `.forEach()` with `async/await` for traversing the array components and using await on the current component. This is why my iterative version of DFS worked. The recursive version should also work if I would use `for` loop instead of `.forEach()`.
