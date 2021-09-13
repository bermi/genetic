/** This module is browser compatible. */

import type {
  compare,
  compareDefined,
  direction,
  mapDefined,
} from "../common.ts";
import { ascend } from "../comparators.ts";
import { BSTree } from "./bs_tree.ts";
import { RBNode } from "./rb_node.ts";

/**
 * A red-black tree. The values are in ascending order by default,
 * using JavaScript's built in comparison operators to sort the values.
 */
export class RBTree<T> extends BSTree<T> {
  declare protected root: RBNode<T> | null;

  constructor(
    compare: compare<Partial<T>> | compareDefined<Partial<T>> = ascend,
  ) {
    super(compare);
  }

  /** Creates a new red-black tree from an array like or iterable object. */
  static from<T, U>(
    collection: ArrayLike<T> | Iterable<T> | RBTree<T>,
  ): RBTree<U>;
  static from<T, U>(
    collection: ArrayLike<T> | Iterable<T> | RBTree<T>,
    options: {
      Node?: typeof RBNode;
      compare?: compare<Partial<U>> | compareDefined<Partial<U>>;
    },
  ): RBTree<U>;
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | RBTree<T>,
    options: {
      Node?: typeof RBNode;
      compare?: compare<Partial<U>> | compareDefined<Partial<U>>;
      map: mapDefined<T, U>;
      thisArg?: V;
    },
  ): RBTree<U>;
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | RBTree<T>,
    options?: {
      Node?: typeof RBNode;
      compare?: compare<Partial<U>> | compareDefined<Partial<U>>;
      map?: mapDefined<T, U>;
      thisArg?: V;
    },
  ): RBTree<U> {
    return BSTree.from(
      collection,
      { Tree: RBTree, Node: RBNode, ...options },
    ) as RBTree<U>;
  }

  private removeFixup(parent: RBNode<T> | null, current: RBNode<T> | null) {
    while (parent && !current?.red) {
      const direction: direction = parent.left === current ? "left" : "right";
      const siblingDirection: direction = direction === "right"
        ? "left"
        : "right";
      let sibling: RBNode<T> | null = parent[siblingDirection];

      if (sibling?.red) {
        sibling.red = false;
        parent.red = true;
        this.rotateNode(parent, direction);
        sibling = parent[siblingDirection];
      }
      if (sibling) {
        if (!sibling.left?.red && !sibling.right?.red) {
          sibling!.red = true;
          current = parent;
          parent = current.parent;
        } else {
          if (!sibling[siblingDirection]?.red) {
            sibling[direction]!.red = false;
            sibling.red = true;
            this.rotateNode(sibling, siblingDirection);
            sibling = parent[siblingDirection!];
          }
          sibling!.red = parent.red;
          parent.red = false;
          sibling![siblingDirection]!.red = false;
          this.rotateNode(parent, direction);
          current = this.root;
          parent = null;
        }
      }
    }
    if (current) current.red = false;
  }

  /**
   * Adds the value to the binary search tree if it does not already exist in it.
   * Returns true if successful.
   */
  insert(value: T): boolean {
    let node = this.insertNode(RBNode, value) as (RBNode<T> | null);
    if (node) {
      while (node.parent?.red) {
        let parent: RBNode<T> = node.parent!;
        const parentDirection: direction = parent.directionFromParent()!;
        const uncleDirection: direction = parentDirection === "right"
          ? "left"
          : "right";
        const uncle: RBNode<T> | null = parent.parent![uncleDirection] ?? null;

        if (uncle?.red) {
          parent.red = false;
          uncle.red = false;
          parent.parent!.red = true;
          node = parent.parent!;
        } else {
          if (node === parent[uncleDirection]) {
            node = parent;
            this.rotateNode(node, parentDirection);
            parent = node.parent!;
          }
          parent.red = false;
          parent.parent!.red = true;
          this.rotateNode(parent.parent!, uncleDirection);
        }
      }
      this.root!.red = false;
    }
    return !!node;
  }

  /**
   * Removes node value from the binary search tree if found.
   * Returns true if found and removed.
   */
  remove(value: T): boolean {
    const node = this.removeNode(value) as (RBNode<T> | null);
    if (node && !node.red) {
      this.removeFixup(node.parent, node.left ?? node.right);
    }
    return !!node;
  }
}
