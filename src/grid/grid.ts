import { Entity, IGraph, IGraphNode, Vector2D } from "@/utils";
import { Node } from "@/node";
import { Settings } from "@/settings";
import { GridOnclickComponent } from "./components";
import { Pathfinder } from "@/pathfinder";
import { Ship } from "@/ship";

export class Grid extends Entity implements IGraph {
    private _nodes: Node[] = [];
    private _pathfinder = new Pathfinder(this, Grid.Heuristic);
    private _currentPath: Node[] = [];
    public ActiveShip: Ship | null = null;
    private _targetNode: Node | null = null;

    public get Nodes(): Node[] {
        return this._nodes;
    }

    public static Heuristic = (a: IGraphNode, b: IGraphNode): number =>
        Math.abs(a.Position.x - b.Position.x) +
        Math.abs(a.Position.y - b.Position.y);

    public Awake(): void {
        this.AddComponent(new GridOnclickComponent());
        // awake components
        super.Awake();
        this.InitNodes();

        // awake children
        for (const node of this._nodes) {
            node.Awake();
        }
    }

    public Update(deltaTime: number): void {
        // update components
        super.Update(deltaTime);

        // update children
        for (const node of this._nodes) {
            node.Update(deltaTime);
        }
    }

    private InitNodes(): void {
        const size = Settings.grid.nodeSize;
        const offset = Settings.grid.nodeOffset;
        for (let y = 0; y < Settings.grid.dimension; y++) {
            for (let x = 0; x < Settings.grid.dimension; x++) {
                const start = new Vector2D(
                    x * (size + offset) + offset,
                    y * (size + offset) + offset
                );

                const end = new Vector2D(start.x + size, start.y + size);

                const index = new Vector2D(x, y);

                const top = this.Nodes.find(
                    (node) =>
                        node.Index.x === index.x && node.Index.y === index.y - 1
                );
                const left = this.Nodes.find(
                    (node) =>
                        node.Index.x === index.x - 1 && node.Index.y === index.y
                );
                const neighbors: Node[] = [];

                const node = new Node(start, end, index, neighbors);
                if (left) {
                    neighbors.push(left);
                    left.Neighbors.push(node);
                }

                if (top) {
                    neighbors.push(top);
                    top.Neighbors.push(node);
                }
                this._nodes.push(node);
            }
        }
    }

    public GetCost(a: Node, b: Node): number {
        return 1;
    }
    public GetNeighborsOf(node: Node): Node[] {
        return node.Neighbors;
    }

    public CalcPathAndMoveActive(node: Node): void {
        this._currentPath.forEach((item) => (item.IsOnPath = false));
        if (!this.ActiveShip) {
            return;
        }
        if (node === this._targetNode) {
            this.UnHighlightAll();
            this._targetNode = null;
            this.ActiveShip.Move(this._currentPath);
            return;
        }

        this._targetNode = node;
        this._currentPath = this._pathfinder.CalculatePath(
            this.ActiveShip.Node,
            node
        ) as Node[];
        this._currentPath.forEach((item) => (item.IsOnPath = true));
    }

    private UnHighlightAll(): void {
        this._nodes.forEach((node) => {
            node.IsInLocomotionRange = false;
            node.IsOnPath = false;
        });
    }
}
