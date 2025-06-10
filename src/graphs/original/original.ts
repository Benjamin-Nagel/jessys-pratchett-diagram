import * as d3 from "d3";

import discworldData, { serieColors, patternDefinitions } from "../../data";
import {
  initializeSvgContainer,
  createTooltip,
  hideTooltip,
} from "../../utils/common";
import type { Book, RunningCharacter } from "../../types";
import type { BookPosition } from "../../utils/types";
import {
  drawCharacterLegend,
  drawGenreLegend,
  drawSeriesLegend,
  updateRightLegendPositions,
} from "./provider/legends";
import { deactivateActiveHighlight } from "./provider/actions";
import { drawBookNodes, drawCharacterLinks } from "./provider/drawer";

export type ActiveInformation = {
  activeCharachterId: number | null;
  activeLegendType: "character" | "serie" | "genre" | null;
};
const activeInformation: ActiveInformation = {
  activeCharachterId: null,
  activeLegendType: null,
};

export type CurrentInformation = {
  currentBookGroup: d3.Selection<
    SVGGElement,
    BookPosition,
    SVGGElement,
    unknown
  > | null;
  currentZoomedG: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null;
  currentBooks: Book[];
  currentCharacters: RunningCharacter[];
};
const currentInformation: CurrentInformation = {
  currentBookGroup: null,
  currentZoomedG: null,
  currentBooks: [],
  currentCharacters: [],
};

export const DRAG_THRESHOLD = 5;

export type LegendContentGroups = {
    character: d3.Selection<
            SVGGElement,
            unknown,
            HTMLElement,
            any
        > | null;
    series: d3.Selection<
            SVGGElement,
            unknown,
            HTMLElement,
            any
        > | null;
    genre: d3.Selection<
            SVGGElement,
            unknown,
            HTMLElement,
            any
        > | null;
}
const legendContentGroups: LegendContentGroups = {
    character: null,
    series: null,
    genre: null,
}

/**
 * Adds SVG patterns (<defs> <pattern>) to the SVG.
 * @param svg The D3 selection for the main SVG element.
 */
function addSvgPatterns(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
) {
  const defs = svg.append("defs");

  patternDefinitions.forEach((pattern) => {
    if (pattern.type === "dotted") {
      const patternElement = defs
        .append("pattern")
        .attr("id", pattern.id)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 10)
        .attr("height", 10);

      patternElement
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", pattern.colors.primary);

      patternElement
        .append("circle")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 2)
        .attr("fill", pattern.colors.secondary);
    }
  });
}

/**
 * Creates the Original Discworld Graph visualization.
 * @param svgSelector The CSS selector for the SVG element to draw on (e.g., "#chart").
 */
export function createGraph(svgSelector: string) {
  const books = discworldData.books;
  const characters = discworldData.characters;

  currentInformation.currentCharacters = characters;
  currentInformation.currentBooks = books;

  characters.forEach((char, idx) => {
    if (typeof char.id === "undefined") {
      (char as RunningCharacter).id = idx + 1000;
    }
  });

  const diagramInternalWidth = 1800;
  const diagramInternalHeight = 1100;


  const svgElements = initializeSvgContainer(
    svgSelector,
    diagramInternalWidth,
    diagramInternalHeight
  );
  if (!svgElements) {
    return;
  }
  const { svg, zoomedG, zoomBehavior } = svgElements;

  currentInformation.currentZoomedG = zoomedG;

  zoomBehavior!.scaleExtent([0.5, 8]);
  const initialZoomScale = 1.2;
  const initialZoom = d3.zoomIdentity
    .translate(250, 30)
    .scale(initialZoomScale);
  svg.call(zoomBehavior!.transform, initialZoom);

  addSvgPatterns(svg);

  const tooltip = createTooltip();

  if (zoomBehavior) {
    zoomBehavior.on("zoom.hideTooltip", () => {
      hideTooltip(tooltip);
    });
  }

  const bookGroup = drawBookNodes(
    zoomedG,
    books,
    tooltip
  );
  currentInformation.currentBookGroup = bookGroup;

  drawCharacterLinks(
    characters,
    books,
    tooltip,
    activeInformation,
    currentInformation,
  );

  drawCharacterLegend(
    svg,
    characters.filter((char) => char.color),
    tooltip,
    activeInformation, currentInformation,
    legendContentGroups
  );

  drawSeriesLegend(
    svg,
    serieColors,
    tooltip,
    activeInformation,currentInformation,
    legendContentGroups
  );

  const allGenres = Array.from(new Set(books.flatMap((book) => book.genres)));

  drawGenreLegend(
    svg,
    allGenres,
    tooltip,
    activeInformation,
    currentInformation,
    legendContentGroups
  );

  svg.on("click", function (event) {
    if (!event.defaultPrevented) {
      deactivateActiveHighlight(activeInformation, currentInformation);
    }
  });

  updateRightLegendPositions(legendContentGroups);

  window.addEventListener("resize", (_) => updateRightLegendPositions(legendContentGroups));
}
