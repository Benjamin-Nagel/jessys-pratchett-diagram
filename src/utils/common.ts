import * as d3 from "d3";

interface SvgContainerElements {
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  zoomedG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  staticUIG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null;
}

/**
 * Initializes a D3 SVG container with viewbox and aspect ratio.
 * Sets up zoom behavior and attempts to fit the graph to the container's initial size.
 *
 * @param selector The CSS selector for the SVG element.
 * @param internalWidth The intended internal width of the graph (for viewBox).
 * @param internalHeight The intended internal height of the graph (for viewBox).
 * @param enableZoom Whether to enable zoom behavior (default: true).
 * @returns An object containing the D3 selection for SVG, zoomed group, static UI group, and the zoom behavior.
 */
export function initializeSvgContainer(
  selector: string,
  internalWidth: number,
  internalHeight: number,
  enableZoom: boolean = true
): SvgContainerElements | null {
  const svgElement = document.querySelector<SVGSVGElement>(selector);
  if (!svgElement) {
    console.error(`SVG element with selector ${selector} not found.`);
    return null;
  }

  const svg = d3
    .select(selector)
    .attr("viewBox", `0 0 ${internalWidth} ${internalHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  svg.selectAll("*").remove();

  const zoomedG = svg.append("g").attr("class", "zoomed-content");
  const staticUIG = svg.append("g").attr("class", "static-ui");

  let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

  if (enableZoom) {
    zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .translateExtent([
        [-internalWidth * 2, -internalHeight * 2], 
        [internalWidth * 3, internalHeight * 3],
      ])
      .on("zoom", (event) => {
        zoomedG.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);
  }

  return { svg, zoomedG, staticUIG, zoomBehavior };
}

/**
 * Creates and appends a global D3 tooltip div to the body.
 * @returns A D3 selection for the tooltip div.
 */
export function createTooltip(): d3.Selection<HTMLDivElement, unknown, HTMLElement, any> {
  let tooltip = d3.select("body").select(".tooltip");
  if (tooltip.empty()) { // Only create if it doesn't already exist
    tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  }
  return tooltip;
}

/**
 * Shows the tooltip with provided content at event coordinates.
 * @param tooltipD3Selection The D3 selection of the tooltip.
 * @param content The HTML content for the tooltip.
 * @param event The D3 event object.
 */
export function showTooltip(
  tooltipD3Selection: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  content: string,
  event: d3.D3E_BaseType 
) {
  tooltipD3Selection
    .html(content)
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 20 + "px")
    .transition()
    .duration(200)
    .style("opacity", 0.9);
}

/**
 * Hides the tooltip.
 * @param tooltipD3Selection The D3 selection of the tooltip.
 */
export function hideTooltip(
  tooltipD3Selection: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>
) {
  tooltipD3Selection.transition().duration(500).style("opacity", 0);
}