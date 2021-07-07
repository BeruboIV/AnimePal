/*
    >Here we make database calls and use async/await to handle Promises.
    >This uses the iterative version of DFS.
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

/*
    > Here the whole async function is paused until Graph.findOne() returns a resolved Promise. 
    > In our case, since the nodes will be present in the database, then we will be getting a resolved Promise. 
    > The chance of rejection is slim but can still happen if the database hangs up exexpectedly
*/

const order = []; // Stores the DFS ordering

(async function (callback) {
    const stack = [];
    stack.push(1);
    while (stack.length) {
        let s = stack.pop();
        order.push(s);
        let node = await Graph.findOne({ val: s });
        if (node != null) {
            let n = node.adj.length;
            if (n > 0) {
                for (let i = n - 1; i >= 0; i--) {
                    stack.push(node.adj[i]);
                }
            }
        }
    }
    callback();
})(two);

function two() {
    console.log(order);
}

// setTimeout(() => console.log(order), 500);
