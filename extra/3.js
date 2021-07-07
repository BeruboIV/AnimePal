/*
    > Here we are using .forEach() instead of for loop.
    > .forEach(fun) requires a function as a parameter
    > It is inside that function that we are calling await. Hence it is the sub-function that will be on halt!
    > .forEach() will keep on calling the sub-asynchronous functions independently.
    > This gives the wrong output as DFS ordering is not followed
*/
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const graphSchema = new mongoose.Schema({
    val: Number,
    adj: [Number],
});

const Graph = new mongoose.model("Graph", graphSchema);

// async function seed() {
//     const graph = await Graph.insertMany([
//         { val: 1, adj: [2, 3, 4] },
//         { val: 2, adj: [5] },
//     ]);
//     console.log(graph);
// }

// async function seed() {
//     const graph = await Graph.insertMany([
//         { val: 1, adj: [2, 3, 4] },
//         { val: 2, adj: [5] },
//         { val: 3, adj: [6, 7] },
//         { val: 7, adj: [8] },
//     ]);
//     console.log(graph);
// }

// seed();

const order = [];

async function dfs(src) {
    order.push(src);
    console.log(src);
    const node = await Graph.findOne({ val: src });
    console.log(node);
    if (node != null) {
        if (node.adj.length > 0) {
            node.adj.forEach(async (child) => {
                await dfs(child);
            });
        }
        // console.log(node.adj);
    }
    return order;
}
dfs(1);
