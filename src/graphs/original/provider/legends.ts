import * as d3 from "d3";
import type { Genre, RunningCharacter, Serie } from "../../../types";
import {
  type ActiveInformation,
  type CurrentInformation,
  type LegendContentGroups,
} from "../original";
import {
  deactivateActiveHighlight,
  handleCharacterHoverOff,
  handleCharacterHoverOn,
} from "./actions";
import {
  applyCharacterHighlight,
  getCharacterDisplayColor,
  usesPattern,
} from "./drawer";
import type { BookPosition } from "../../../utils/types";
import { showTooltip } from "../../../utils/common";

/**
 * Toggles the visibility of a legend's content.
 * @param legendGroup The D3 selection for the legend's main group.
 * @param contentGroup The D3 selection for the legend's collapsible content group.
 */
export function toggleLegendVisibility(
  legendGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  title: d3.Selection<SVGTextElement, unknown, HTMLElement, any>,
  contentGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  legendContentGroups: LegendContentGroups
) {
  const isHidden = contentGroup.classed("hidden-content");
  contentGroup.classed("hidden-content", !isHidden);
  const currentText = title.text();
  const titleOnly = currentText.substring(0, currentText.length - 1);
  title.text(titleOnly + (isHidden ? "−" : "+"));

  if (
    legendGroup.classed("series-legend") ||
    legendGroup.classed("genre-legend")
  ) {
    updateRightLegendPositions(legendContentGroups);
  }
}

/**
 * Updates the positions of right-side legends based on the SVG's viewBox width.
 */
export function updateRightLegendPositions(
  legendContentGroups: LegendContentGroups
) {
  const svgElement = d3.select("svg").node() as SVGSVGElement;
  if (!svgElement) {
    console.warn("SVG element not found for legend positioning.");
    return;
  }

  const viewBoxWidth = svgElement.viewBox.baseVal.width;
  const rightMargin = 30;

  const estimatedLegendWidth = 200;

  const fixedRightLegendX = viewBoxWidth - estimatedLegendWidth - rightMargin;
  let currentRightY = 30;

  if (legendContentGroups.series) {
    const parentLegendGroup = d3.select(
      legendContentGroups.series.node()?.parentNode as Element
    );
    parentLegendGroup.attr(
      "transform",
      `translate(${fixedRightLegendX}, ${currentRightY})`
    );

    const titleNode = parentLegendGroup.select(".legend-title").node();
    const titleBBox =
      titleNode && "getBBox" in titleNode
        ? (titleNode as SVGGraphicsElement).getBBox()
        : undefined;
    const titleHeight = titleBBox ? titleBBox.height : 0;

    const contentBBox = legendContentGroups.series.node()?.getBBox();
    const contentActualHeight = legendContentGroups.series.classed(
      "hidden-content"
    )
      ? 0
      : contentBBox
      ? contentBBox.height
      : 0;

    currentRightY += titleHeight + contentActualHeight;
    currentRightY += 20;
  }

  if (legendContentGroups.genre) {
    const parentLegendGroup = d3.select(
      legendContentGroups.genre.node()?.parentNode as Element
    );
    parentLegendGroup.attr(
      "transform",
      `translate(${fixedRightLegendX}, ${currentRightY})`
    );
  }
}

/**
 * Draws the character legend and provides interaction for highlighting.
 * @param parentSvg The D3 selection for the main SVG element.
 * @param characters All running character data.
 * @param tooltip The D3 tooltip selection.
 */
export function drawCharacterLegend(
  parentSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  characters: RunningCharacter[],
  tooltip: d3.Selection<
    d3.BaseType | HTMLDivElement,
    unknown,
    HTMLElement,
    any
  >,
  activeInformation: ActiveInformation,
  currentInformation: CurrentInformation,
  legendContentGroups: LegendContentGroups
) {
  const legendOffsetX = 50;
  const marginTop = 30;

  const legend = parentSvg
    .append("g")
    .attr("class", "legend character-legend")
    .attr("transform", `translate(${legendOffsetX}, ${marginTop})`);

  const legendTitle = legend
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text("Main Characters: -")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .attr("class", "legend-title");
  legendTitle.on("click", () =>
    toggleLegendVisibility(
      legend,
      legendTitle,
      contentGroup,
      legendContentGroups
    )
  );

  const contentGroup = legend.append("g").attr("class", "legend-content");
  legendContentGroups.character = contentGroup;

  let currentLegendY = 20;
  const rowHeight = 20;

  const sortedCharacters = [...characters].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  sortedCharacters.forEach((char, i) => {
    const characterId = char.id !== undefined ? char.id : i;
    const legendItemGroupClass = `legend-item-group-${characterId}`;

    const row = contentGroup
      .append("g")
      .datum(char)
      .attr("class", `legend-item-group ${legendItemGroupClass}`)
      .attr("transform", `translate(0, ${currentLegendY})`)
      .style("cursor", "pointer");

    row
      .append("rect")
      .attr("width", 16)
      .attr("height", 16)
      .attr("fill", (d) =>
        getCharacterDisplayColor(d as RunningCharacter, "fill")
      )
      .attr("stroke", "black");

    if (usesPattern(char)) {
      row
        .append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", "none")
        .attr("stroke", getCharacterDisplayColor(char, "stroke"))
        .attr("stroke-width", 2);
    }

    row
      .append("text")
      .text((d) => (d as RunningCharacter).name)
      .attr("x", 22)
      .attr("y", 12)
      .attr("font-size", "14px")
      .attr("dominant-baseline", "middle");

    row
      .on("mouseover", function (event, d) {
        handleCharacterHoverOn(
          event,
          d as RunningCharacter,
          tooltip,
          activeInformation,
          currentInformation
        );
      })
      .on("mouseout", function () {
        handleCharacterHoverOff(activeInformation, currentInformation);
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        const clickedChar = d as RunningCharacter;
        if (
          activeInformation.activeLegendType === "character" &&
          activeInformation.activeCharachterId === clickedChar.id
        ) {
          deactivateActiveHighlight(activeInformation, currentInformation);
        } else {
          deactivateActiveHighlight(activeInformation, currentInformation);
          applyCharacterHighlight(
            clickedChar,
            true,
            true,
            activeInformation,
            currentInformation
          );
        }
      });

    currentLegendY += rowHeight + 5;
  });
}

/**
 * Draws the legend for series and provides interaction for highlighting.
 * @param parentSvg The D3 selection for the main SVG element.
 * @param seriesColors Map of series names to colors.
 * @param tooltip The D3 tooltip selection.
 * @returns The D3 selection of the series legend group.
 */
export function drawSeriesLegend(
  parentSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  seriesColors: { [key in Serie]: string },
  tooltip: d3.Selection<
    d3.BaseType | HTMLDivElement,
    unknown,
    HTMLElement,
    any
  >,
  activeInformation: ActiveInformation,
  currentInformation: CurrentInformation,
  legendContentGroups: LegendContentGroups
): d3.Selection<SVGGElement, unknown, HTMLElement, any> {
  const legend = parentSvg.append("g").attr("class", "legend series-legend");

  const legendTitle = legend
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text("Series: -")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .attr("class", "legend-title");

  legendTitle.on("click", () =>
    toggleLegendVisibility(
      legend,
      legendTitle,
      contentGroup,
      legendContentGroups
    )
  );

  const contentGroup = legend.append("g").attr("class", "legend-content");
  legendContentGroups.series = contentGroup;

  let currentLegendY = 20;
  const rowHeight = 20;

  Object.entries(seriesColors).forEach(([serieName, color]) => {
    const legendItemGroupClass = `legend-item-group-serie-${serieName.replace(
      /\s+/g,
      "-"
    )}`;

    const row = contentGroup
      .append("g")
      .datum(serieName as Serie)
      .attr("class", `legend-item-group ${legendItemGroupClass}`)
      .attr("transform", `translate(0, ${currentLegendY})`)
      .style("cursor", "pointer");

    row
      .append("rect")
      .attr("width", 16)
      .attr("height", 16)
      .attr("fill", color)
      .attr("stroke", "black");

    row
      .append("text")
      .text(serieName)
      .attr("x", 22)
      .attr("y", 12)
      .attr("font-size", "14px")
      .attr("dominant-baseline", "middle");

    row
      .on("mouseover", function (event, d) {
        handleSerieHoverOn(
          event,
          d as Serie,
          tooltip,
          activeInformation,
          currentInformation
        );
      })
      .on("mouseout", function () {
        handleSerieHoverOff(activeInformation, currentInformation);
      })
      .on("click", function (event, d) {
        event.stopPropagation();

        const clickedSerie = d as Serie;

        if (
          activeInformation.activeLegendType === "serie" &&
          d3.select(this).classed("highlighted-legend-item")
        ) {
          deactivateActiveHighlight(activeInformation, currentInformation);
        } else {
          deactivateActiveHighlight(activeInformation, currentInformation);
          applySerieHighlight(
            clickedSerie,
            true,
            true,
            activeInformation,
            currentInformation
          );
        }
      });

    currentLegendY += rowHeight + 5;
  });
  return legend;
}

/**
 * Applies or removes highlight for series.
 * @param serie The series to highlight/de-highlight.
 * @param enable True to enable highlighting, false to disable.
 * @param isClickHighlight True if it's a click highlight.
 */
function applySerieHighlight(
  serie: Serie,
  enable: boolean,
  isClickHighlight: boolean,
  activeInformation: ActiveInformation,
  currentInformatin: CurrentInformation
) {
  if (
    !currentInformatin.currentBookGroup ||
    !currentInformatin.currentZoomedG
  ) {
    console.error("currentBookGroup or currentZoomedG not initialized!");
    return;
  }

  const legendItemGroupClass = `legend-item-group-serie-${serie.replace(
    /\s+/g,
    "-"
  )}`;

  if (enable) {
    currentInformatin.currentZoomedG
      .selectAll(`path.link`)
      .attr("opacity", 0.05);
    currentInformatin.currentZoomedG
      .selectAll(`path.link-pattern`)
      .attr("opacity", 0.05);
    currentInformatin.currentBookGroup.style("opacity", 0.2);
    d3.selectAll(".legend-item-group").classed(
      "highlighted-legend-item",
      false
    );
    d3.selectAll(".legend-item-group").classed("dimmed-legend-item", true);

    const relevantBookIds = currentInformatin.currentBooks
      .filter((book) => book.serie === serie)
      .map((b) => `book-${b.id}`);
    currentInformatin.currentBookGroup.each(function (bookPos: BookPosition) {
      if (relevantBookIds.includes(bookPos.id)) {
        d3.select(this).style("opacity", 1);
      }
    });

    currentInformatin.currentZoomedG
      .selectAll("path.link")
      .filter((d: any) => {
        return (
          relevantBookIds.includes(d.source.id) &&
          relevantBookIds.includes(d.target.id)
        );
      })
      .attr("opacity", 1)
      .raise();
    currentInformatin.currentZoomedG
      .selectAll("path.link-pattern")
      .filter((d: any) => {
        return (
          relevantBookIds.includes(d.source.id) &&
          relevantBookIds.includes(d.target.id)
        );
      })
      .attr("opacity", 1)
      .raise();

    d3.select(`.${legendItemGroupClass}`).classed(
      "highlighted-legend-item",
      true
    );
    d3.select(`.${legendItemGroupClass}`).classed("dimmed-legend-item", false);
  } else {
    deactivateActiveHighlight(activeInformation, currentInformatin);
  }

  if (isClickHighlight) {
    activeInformation.activeLegendType = enable ? "serie" : null;
    activeInformation.activeCharachterId = null;
  }
}

/**
 * Function for series hover (mouseover) behavior.
 * @param event The D3 event object.
 * @param serie The series being hovered.
 * @param tooltip The D3 tooltip.
 */
function handleSerieHoverOn(
  event: MouseEvent,
  serie: Serie,
  tooltip: d3.Selection<
    d3.BaseType | HTMLDivElement,
    unknown,
    HTMLElement,
    any
  >,
  activeInformation: ActiveInformation,
  currentInformation: CurrentInformation
) {
  if (
    activeInformation.activeLegendType === null ||
    (activeInformation.activeLegendType === "serie" &&
      d3
        .select(`.legend-item-group-serie-${serie.replace(/\s+/g, "-")}`)
        .classed("highlighted-legend-item"))
  ) {
    applySerieHighlight(
      serie,
      true,
      false,
      activeInformation,
      currentInformation
    );
    showTooltip(tooltip, `<strong>Serie:</strong> ${serie}`, event);
  }
}

/**
 * Function for removing series hover (mouseout) behavior.
 * @param tooltip The D3 tooltip.
 */
function handleSerieHoverOff(
  activeInformation: ActiveInformation,
  currentInformation: CurrentInformation
) {
  if (activeInformation.activeLegendType === null) {
    deactivateActiveHighlight(activeInformation, currentInformation);
  }
}

/**
 * Draws the legend for genres and provides interaction for highlighting.
 * @param parentSvg The D3 selection for the main SVG element.
 * @param genres An array of unique genre names.
 * @param tooltip The D3 tooltip selection.
 */
export function drawGenreLegend(
  parentSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  genres: string[],
  tooltip: d3.Selection<
    d3.BaseType | HTMLDivElement,
    unknown,
    HTMLElement,
    any
  >,
  activeInformation: ActiveInformation,
  currentInformation: CurrentInformation,
  legendContentGroups: LegendContentGroups
) {
  const legend = parentSvg.append("g").attr("class", "legend genre-legend");

  const legendTitle = legend
    .append("text")
    .attr("x", 0)
    .attr("y", 10)
    .text("Genres: -")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .attr("class", "legend-title");

  legendTitle.on("click", () =>
    toggleLegendVisibility(
      legend,
      legendTitle,
      contentGroup,
      legendContentGroups
    )
  );

  const contentGroup = legend.append("g").attr("class", "legend-content");
  legendContentGroups.genre = contentGroup;

  let currentLegendY = 20;
  const rowHeight = 20;

  const sortedGenres = [...genres].sort();

  sortedGenres.forEach((genre) => {
    const legendItemGroupClass = `legend-item-group-genre-${genre.replace(
      /\s+/g,
      "-"
    )}`;

    const row = contentGroup
      .append("g")
      .datum(genre)
      .attr("class", `legend-item-group ${legendItemGroupClass}`)
      .attr("transform", `translate(0, ${currentLegendY})`)
      .style("cursor", "pointer");

    const symbolGenerator = d3.symbol().type(d3.symbolTriangle).size(64);
    row
      .append("path")
      .attr("d", symbolGenerator())
      .attr("transform", "translate(7.5, 7.5)")
      .attr("fill", "lightgray")
      .attr("stroke", "black");

    row
      .append("text")
      .text(genre)
      .attr("x", 22)
      .attr("y", 12)
      .attr("font-size", "14px")
      .attr("dominant-baseline", "middle");

    row
      .on("mouseover", function (event, d) {
        handleGenreHoverOn(
          event,
          d as Genre,
          tooltip,
          activeInformation,
          currentInformation
        );
      })
      .on("mouseout", function () {
        handleGenreHoverOff(activeInformation, currentInformation);
      })
      .on("click", function (event, d) {
        event.stopPropagation(); 

        const clickedGenre = d as Genre;
        if (
          activeInformation.activeLegendType === "genre" &&
          d3.select(this).classed("highlighted-legend-item")
        ) {
          deactivateActiveHighlight(activeInformation, currentInformation);
        } else {
          deactivateActiveHighlight(activeInformation, currentInformation);
          applyGenreHighlight(
            clickedGenre,
            true,
            true,
            activeInformation,
            currentInformation
          );
        }
      });

    currentLegendY += rowHeight + 5;
  });
}

/**
 * Applies or removes highlight for genres.
 * @param genre The genre to highlight/de-highlight.
 * @param enable True to enable highlighting, false to disable.
 * @param isClickHighlight True if it's a click highlight.
 */
function applyGenreHighlight(
  genre: Genre,
  enable: boolean,
  isClickHighlight: boolean,
  activeInformation: ActiveInformation,
  currentInformatin: CurrentInformation
) {
  if (
    !currentInformatin.currentBookGroup ||
    !currentInformatin.currentZoomedG
  ) {
    console.error("currentBookGroup or currentZoomedG not initialized!");
    return;
  }

  const legendItemGroupClass = `legend-item-group-genre-${genre.replace(
    /\s+/g,
    "-"
  )}`;

  if (enable) {
    currentInformatin.currentZoomedG
      .selectAll(`path.link`)
      .attr("opacity", 0.05);
    currentInformatin.currentZoomedG
      .selectAll(`path.link-pattern`)
      .attr("opacity", 0.05);
    currentInformatin.currentBookGroup.style("opacity", 0.2);
    d3.selectAll(".legend-item-group").classed(
      "highlighted-legend-item",
      false
    );
    d3.selectAll(".legend-item-group").classed("dimmed-legend-item", true);

    const relevantBookIds = currentInformatin.currentBooks
      .filter((book) => book.genres.includes(genre))
      .map((b) => `book-${b.id}`);
    currentInformatin.currentBookGroup.each(function (bookPos: BookPosition) {
      if (relevantBookIds.includes(bookPos.id)) {
        d3.select(this).style("opacity", 1);
      }
    });

    currentInformatin.currentZoomedG
      .selectAll("path.link")
      .filter((d: any) => {
        return (
          relevantBookIds.includes(d.source.id) &&
          relevantBookIds.includes(d.target.id)
        );
      })
      .attr("opacity", 1)
      .raise();
    currentInformatin.currentZoomedG
      .selectAll("path.link-pattern")
      .filter((d: any) => {
        return (
          relevantBookIds.includes(d.source.id) &&
          relevantBookIds.includes(d.target.id)
        );
      })
      .attr("opacity", 1)
      .raise();

    d3.select(`.${legendItemGroupClass}`).classed(
      "highlighted-legend-item",
      true
    );
    d3.select(`.${legendItemGroupClass}`).classed("dimmed-legend-item", false);
  } else {
    deactivateActiveHighlight(activeInformation, currentInformatin);
  }

  if (isClickHighlight) {
    activeInformation.activeLegendType = enable ? "genre" : null;
    activeInformation.activeCharachterId = null;
  }
}

/**
 * Function for genre hover (mouseover) behavior.
 * @param event The D3 event object.
 * @param genre The genre being hovered.
 * @param tooltip The D3 tooltip.
 */
function handleGenreHoverOn(
  event: MouseEvent,
  genre: Genre,
  tooltip: d3.Selection<
    d3.BaseType | HTMLDivElement,
    unknown,
    HTMLElement,
    any
  >,
  activeInformation: ActiveInformation,
  currentInformatin: CurrentInformation
) {
  if (
    activeInformation.activeLegendType === null ||
    (activeInformation.activeLegendType === "genre" &&
      d3
        .select(`.legend-item-group-genre-${genre.replace(/\s+/g, "-")}`)
        .classed("highlighted-legend-item"))
  ) {
    applyGenreHighlight(
      genre,
      true,
      false,
      activeInformation,
      currentInformatin
    );
    showTooltip(tooltip, `<strong>Genre:</strong> ${genre}`, event);
  }
}

/**
 * Function for removing genre hover (mouseout) behavior.
 * @param tooltip The D3 tooltip.
 */
function handleGenreHoverOff(
  activeInformation: ActiveInformation,
  currentInformatin: CurrentInformation
) {
  if (activeInformation.activeLegendType === null) {
    deactivateActiveHighlight(activeInformation, currentInformatin);
  }
}
