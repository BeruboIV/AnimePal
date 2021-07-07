/*
    >This is the normal way of writing DFS. 
    >This will give no error as no calls to database are made. This is a synchronous code.
*/

const adj = [[], [2, 3, 4], [5], [6, 7], [], [], [], [8], []];
const order = [];
function dfs(src) {
    order.push(src);
    if (adj.length > src) {
        adj[src].forEach((child) => dfs(child));
    }
}

dfs(1);
console.log(order);
