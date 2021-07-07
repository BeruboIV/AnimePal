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
    // console.log(src);
    const node = await Graph.findOne({ val: src });
    // console.log(node);
    if (node != null) {
        let n = node.adj.length;
        if (n > 0) {
            for (let i = 0; i < n; i++) {
                const res = await dfs(node.adj[i]);
                console.log(src, res ? res.val : null);
            }
        }
        // console.log(node.adj);
    }
    // return new Promise((resolve, reject) => {
    //     reject("Oh no eroor");
    // });
    return new Promise((resolve, reject) => {
        resolve(node);
    });
}
