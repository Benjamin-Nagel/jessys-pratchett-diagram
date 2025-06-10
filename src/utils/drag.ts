import * as d3 from "d3";
import type { GraphLink, GraphNode } from "./types";

/**
 * Provides a D3 drag behavior for force simulation nodes.
 * @param simulation The D3 force simulation instance.
 * @returns A D3 drag behavior.
 */
export function createDragBehavior(simulation: d3.Simulation<GraphNode, GraphLink>) {
  function dragstarted(event: d3.D3DragEvent<SVGElement, GraphNode, GraphNode>) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: d3.D3DragEvent<SVGElement, GraphNode, GraphNode>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: d3.D3DragEvent<SVGElement, GraphNode, GraphNode>) {
    if (!event.active) simulation.alphaTarget(0);
  }

  return d3
    .drag<SVGElement, GraphNode>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}