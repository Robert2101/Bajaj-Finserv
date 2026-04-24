require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/bfhl', (req, res) => { 
    try {
        const { data } = req.body;
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: "Invalid input format. Expected 'data' array." });
        }

        const invalid_entries = [];
        const seen_edges = new Set();
        const duplicate_edges_set = new Set();
        const parents = new Map();
        const children = new Map(); 
        const all_nodes = new Set();
        const undirected = new Map(); 

        const addUndirected = (u, v) => {
            if (!undirected.has(u)) undirected.set(u, []);
            if (!undirected.has(v)) undirected.set(v, []);
            undirected.get(u).push(v);
            undirected.get(v).push(u);
        };

        data.forEach(item => {
            if (typeof item !== 'string') return;
            const edge = item.trim();

            if (!/^[A-Z]->[A-Z]$/.test(edge) || edge[0] === edge[3]) {
                invalid_entries.push(item);
                return;
            }

            if (seen_edges.has(edge)) {
                duplicate_edges_set.add(edge);
            } else {
                seen_edges.add(edge);
                const parent = edge[0];
                const child = edge[3];

                all_nodes.add(parent);
                all_nodes.add(child);

                if (!parents.has(child)) {
                    parents.set(child, parent);
                    if (!children.has(parent)) children.set(parent, []);
                    children.get(parent).push(child);
                    addUndirected(parent, child);
                }
            }
        });

        const roots = [];
        all_nodes.forEach(node => {
            if (!parents.has(node)) {
                roots.push(node); 
            }
        });

        const hierarchies = [];
        const visited = new Set();
        let total_trees = 0;
        let total_cycles = 0;
        let largest_tree_root = "";
        let max_depth = 0;

        const buildTree = (node) => {
            visited.add(node);
            const tree = {};
            let depth = 1;

            const childNodes = children.get(node) || [];
            childNodes.forEach(child => {
                const res = buildTree(child);
                tree[child] = res.tree;
                depth = Math.max(depth, 1 + res.depth);
            });

            return { tree, depth };
        };

        roots.forEach(root => {
            const { tree, depth } = buildTree(root);
            hierarchies.push({ root, tree: { [root]: tree }, depth });
            total_trees++; 

            if (depth > max_depth) {
                max_depth = depth;
                largest_tree_root = root;
            } else if (depth === max_depth && largest_tree_root !== "") {
                if (root < largest_tree_root) {
                    largest_tree_root = root;
                }
            } else if (depth === max_depth && largest_tree_root === "") {
                largest_tree_root = root;
            }
        });
        all_nodes.forEach(node => {
            if (!visited.has(node)) {
                const component = [];
                const q = [node];
                visited.add(node);

                while (q.length > 0) {
                    const curr = q.shift();
                    component.push(curr);
                    const neighbors = undirected.get(curr) || [];
                    neighbors.forEach(n => {
                        if (!visited.has(n)) {
                            visited.add(n);
                            q.push(n);
                        }
                    });
                }

                component.sort();
                const cycleRoot = component[0];

                hierarchies.push({ root: cycleRoot, tree: {}, has_cycle: true });
                total_cycles++;
            }
        });

        res.status(200).json({
            user_id: "bandarujessyrobert_21012006",
            email_id: "robert_bandaru@srmap.edu.in",   
            college_roll_number: "AP23110011304",
            hierarchies,
            invalid_entries,
            duplicate_edges: Array.from(duplicate_edges_set),
            summary: {
                total_trees,
                total_cycles,
                largest_tree_root: largest_tree_root === "" ? null : largest_tree_root 
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));