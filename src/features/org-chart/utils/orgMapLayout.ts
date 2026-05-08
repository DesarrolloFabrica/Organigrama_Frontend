import type { Edge, Node } from '@xyflow/react'
import type { OrgNode } from '../types'

export type OrgMapNodeData = {
  orgNode: OrgNode
}

export type OrgMapGraph = {
  nodes: Node<OrgMapNodeData>[]
  edges: Edge[]
}

const HORIZONTAL_SPACING = 340
const VERTICAL_SPACING = 240

/**
 * Cuenta cuántos descendientes tiene una rama.
 * Se usa para distribuir espacio horizontal.
 */
function countBranchSize(node: OrgNode): number {
  if (node.children.length === 0) return 1

  return node.children.reduce(
    (total, child) => total + countBranchSize(child),
    0,
  )
}

export function buildOrgMap(root: OrgNode): OrgMapGraph {
  const nodes: Node<OrgMapNodeData>[] = []
  const edges: Edge[] = []

  /**
   * Construye el layout centrando hijos respecto al padre.
   */
  function walk(
    node: OrgNode,
    x: number,
    y: number,
    parentId?: string,
  ) {
    nodes.push({
      id: node.id,
      type: 'orgNode',
      position: { x, y },
      data: {
        orgNode: node,
      },
    })

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: 'rgba(34, 211, 238, 0.45)',
          strokeWidth: 1.6,
        },
      })
    }

    /**
     * Calculamos cuánto ocupa cada rama.
     */
    const branchSizes = node.children.map(countBranchSize)

    const totalWidth =
      branchSizes.reduce((a, b) => a + b, 0) *
      HORIZONTAL_SPACING

    let currentX = x - totalWidth / 2

    node.children.forEach((child, index) => {
      const branchWidth =
        branchSizes[index] * HORIZONTAL_SPACING

      const childX = currentX + branchWidth / 2

      walk(
        child,
        childX,
        y + VERTICAL_SPACING,
        node.id,
      )

      currentX += branchWidth
    })
  }

  walk(root, 0, 0)

  return {
    nodes,
    edges,
  }
}