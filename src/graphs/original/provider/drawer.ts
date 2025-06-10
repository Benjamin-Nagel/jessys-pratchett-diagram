import * as d3 from "d3";
import discworldData, {
  customColors,
  patternDefinitions,
  serieColors,
} from "../../../data";
import type {
  Book,
  RunningCharacter,
  Serie,
  SimpleColorName,
} from "../../../types";
import { hideTooltip, showTooltip } from "../../../utils/common";
import type { BookPosition } from "../../../utils/types";
import {
  type ActiveInformation,
  type CurrentInformation,
} from "../original";
import {
  deactivateActiveHighlight,
  handleCharacterHoverOff,
  handleCharacterHoverOn,
} from "./actions";

const bookWidth = 100;
const bookHeight = 60;

/**
 * Draws the character links (paths) on the SVG.
 * Includes interaction logic for highlighting links and related books/legend.
 * @param zoomedG The D3 selection for the zoomable group.
 * @param links The link data to draw.
 * @param tooltip The D3 tooltip selection.
 * @param bookGroup The D3 selection of book groups (for opacity changes).
 */
export function drawCharacterLinks(
  characters: RunningCharacter[],
  books: Book[],
  tooltip: d3.Selection<d3.BaseType | HTMLDivElement, unknown, HTMLElement, any>,
  activeInformation: ActiveInformation,
  currentInformation: CurrentInformation
) {
  const bookPositions = calculateBookPositions(books);

  const links = generateCharacterLinks(characters, bookPositions);

  currentInformation
    .currentZoomedG!.selectAll("path.link-pattern")
    .data(links)
    .enter()
    .append("path")
    .attr("class", (d) => `link-pattern link-char-${d.character.id}`)
    .attr("d", (d) => {
      const x1 = d.source.x + bookWidth / 2;
      const y1 = d.source.y;
      const x2 = d.target.x + bookWidth / 2;
      const y2 = d.target.y;
      const offset = (d as any).offset || 0;

      const verticalThreshold = 30;
      if (Math.abs(x1 - x2) < verticalThreshold) {
        const curveOffset = x1 < bookWidth / 2 ? -30 : 30;
        return `M${x1 + offset},${y1} C${x1 + offset + curveOffset},${
          y1 + (y2 - y1) / 3
        } ${x2 + offset + curveOffset},${y2 - (y2 - y1) / 3} ${
          x2 + offset
        },${y2}`;
      } else {
        const dx = (x2 - x1) / 2;
        const curveHeight = 40;
        return `M${x1},${y1} C${x1 + dx},${y1 - curveHeight + offset} ${
          x2 - dx
        },${y2 - curveHeight + offset} ${x2},${y2}`;
      }
    })
    .attr("fill", "none")
    .attr("stroke", "none")
    .attr("stroke-width", 0)
    .attr("fill", (d) =>
      usesPattern(d.character)
        ? `url(#pattern-${d.character.color
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")})`
        : "none"
    )
    .attr("opacity", 0.4);

  const linksPaths = currentInformation
    .currentZoomedG!.selectAll("path.link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", (d) => `link link-char-${d.character.id}`)
    .attr("d", (d) => {
      const x1 = d.source.x + bookWidth / 2;
      const y1 = d.source.y;
      const x2 = d.target.x + bookWidth / 2;
      const y2 = d.target.y;

      const offset = (d as any).offset || 0;

      const verticalThreshold = 30;
      if (Math.abs(x1 - x2) < verticalThreshold) {
        const curveOffset = x1 < bookWidth / 2 ? -30 : 30;
        return `M${x1 + offset},${y1} C${x1 + offset + curveOffset},${
          y1 + (y2 - y1) / 3
        } ${x2 + offset + curveOffset},${y2 - (y2 - y1) / 3} ${
          x2 + offset
        },${y2}`;
      } else {
        const dx = (x2 - x1) / 2;
        const curveHeight = 40;
        return `M${x1},${y1} C${x1 + dx},${y1 - curveHeight + offset} ${
          x2 - dx
        },${y2 - curveHeight + offset} ${x2},${y2}`;
      }
    })
    .attr("fill", "none")
    .attr("stroke", (d) => getCharacterDisplayColor(d.character, "stroke"))
    .attr("stroke-width", (d) => (usesPattern(d.character) ? 3 : 1.5))
    .attr("opacity", 0.4);

  linksPaths
    .on("mouseover", function (event, d) {
      handleCharacterHoverOn(
        event,
        d.character,
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

      if (
        activeInformation.activeLegendType === "character" &&
        activeInformation.activeCharachterId === d.character.id
      ) {
        deactivateActiveHighlight(activeInformation, currentInformation);
      } else {
        deactivateActiveHighlight(activeInformation, currentInformation);
        applyCharacterHighlight(
          d.character,
          true,
          true,
          activeInformation,
          currentInformation
        );
      }
    });
}

/**
 * Generates link data for characters connecting books in their reading order.
 * Includes logic to offset overlapping links between the same source/target books.
 * @param characters All running character data.
 * @param bookPositions Pre-calculated positions of books.
 * @returns An array of link objects.
 */
function generateCharacterLinks(
  characters: RunningCharacter[],
  bookPositions: BookPosition[]
) {
  const allLinks = characters.flatMap((char) => {
    const sortedBooks = char.books.sort((a, b) => a.id - b.id);
    const segments = [];

    for (let i = 0; i < sortedBooks.length - 1; i++) {
      const sourceBook = bookPositions.find(
        (b) => b.book.id === sortedBooks[i].id
      );
      const targetBook = bookPositions.find(
        (b) => b.book.id === sortedBooks[i + 1].id
      );
      if (sourceBook && targetBook) {
        segments.push({
          source: sourceBook,
          target: targetBook,
          character: char,
        });
      }
    }
    return segments;
  });

  const linkMap: Map<string, typeof allLinks> = new Map();

  allLinks.forEach((link) => {
    const key = `${link.source.book.id}-${link.target.book.id}`;
    if (!linkMap.has(key)) {
      linkMap.set(key, []);
    }
    linkMap.get(key)!.push(link);
  });

  linkMap.forEach((linksInGroup) => {
    linksInGroup.sort((a, b) => a.character.id - b.character.id);
    const numLinks = linksInGroup.length;
    const offsetFactor = 10;
    linksInGroup.forEach((link, i) => {
      let offsetIndex: number;
      if (numLinks % 2 === 1) {
        offsetIndex = i - Math.floor(numLinks / 2);
      } else {
        offsetIndex = i - numLinks / 2 + 0.5;
      }
      (link as any).offset = offsetIndex * offsetFactor;
    });
  });

  return allLinks;
}

/**
 * Draws the book nodes (rectangles with text) on the SVG.
 * @param zoomedG The D3 selection for the zoomable group.
 * @param books The books.
 * @param tooltip The D3 tooltip selection.
 * @returns The D3 selection of the book groups.
 */
export function drawBookNodes(
  zoomedG: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  books: Book[],
  tooltip: d3.Selection<d3.BaseType | HTMLDivElement, unknown, HTMLElement, any>
) {
  const bookPositions = calculateBookPositions(books);

  const bookGroup = zoomedG
    .selectAll("g.book")
    .data(bookPositions)
    .enter()
    .append("g")
    .attr("class", (d) => `book-group book-${d.book.id}`)
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
    .on("mouseover", function (event, d: BookPosition) {
      showTooltip(
        tooltip,
        `<strong>${d.book.name}</strong><br/>
                Serie: ${d.book.serie}<br/>
                Genres: ${d.book.genres.join(", ") || "N/A"}`,
        event
      );
    })
    .on("mouseout", function () {
      hideTooltip(tooltip);
    })
    .on("click", function (event, d: BookPosition) {
      event.stopPropagation();
      showTooltip(tooltip, `<strong>${d.book.name}</strong><br/>...`, event);
    });

  bookGroup
    .append("rect")
    .attr("width", bookWidth)
    .attr("height", bookHeight)
    .attr("fill", "white")
    .attr("stroke", (d) => {
      const serie = d.book.serie as Serie;
      const color = serieColors[serie];
      return color !== undefined ? color : "#00FF00";
    })
    .attr("stroke-width", 4);

  bookGroup
    .append("circle")
    .attr("cx", bookWidth / 2)
    .attr("cy", 0)
    .attr("r", 4)
    .attr("fill", "black");

  bookGroup
    .append("text")
    .text((d) => d.book.name)
    .attr("x", bookWidth / 2)
    .attr("y", bookHeight / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", "12px")
    .attr("class", "book-name");

  bookGroup
    .selectAll("text.genre")
    .data((d) => d.book.genres.slice(0, 2))
    .enter()
    .append("text")
    .attr(
      "class",
      (d, i) => `genre genre-label genre-${d.replace(/\s+/g, "-")}-${i}`
    )
    .text((g) => g.substring(0, 2).toUpperCase())
    .attr("x", (_, i) => (i === 0 ? 5 : bookWidth - 5))
    .attr("y", 15)
    .attr("text-anchor", (_, i) => (i === 0 ? "start" : "end"))
    .attr("dominant-baseline", "hanging")
    .attr("font-size", "10px");

  return bookGroup;
}

/**
 * Generates the fixed positions for books based on a predefined grid.
 * @param books All available book data.
 * @returns An array of BookPosition objects.
 */
function calculateBookPositions(books: Book[]): BookPosition[] {
  const vBookSpacing = 100;
  const hBookSpacing = 120;
  const marginLeft = 100;
  const marginTop = 30;

  const bookRows = [
    [1, 2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15, 16],
    [17, 18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29],
    [30, 31, 32, 33, 34, 35],
    [36, 37, 38, 39, 40, 41],
  ];

  const bookPositions: BookPosition[] = [];
  const maxBooksInRow = d3.max(bookRows, (row) => row.length) || 0;

  bookRows.forEach((row, rowIndex) => {
    const rowOffset = (maxBooksInRow - row.length) * hBookSpacing; // Right-aligned

    row.forEach((bookId, i) => {
      const book = books.find((b) => b.id === bookId);
      if (!book) {
        console.warn(`Book with ID ${bookId} not found in data.`);
        return;
      }

      const xPos = marginLeft + rowOffset + i * hBookSpacing;
      const yPos = marginTop + rowIndex * vBookSpacing;

      bookPositions.push({
        book,
        x: xPos,
        y: yPos,
        id: `book-${book.id}`,
        type: "book",
      });
    });
  });
  return bookPositions;
}

/**
 * Checks if a character uses a pattern for its color.
 * @param character The character.
 * @returns True if a pattern is used, otherwise False.
 */
export function usesPattern(character: RunningCharacter): boolean {
  const charColorName = character.color;
  const patternId = `pattern-${charColorName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")}`;
  return patternDefinitions.some((p) => p.id === patternId);
}

/**
 * Applies or removes the highlight for a specific character.
 * @param character The character to highlight/de-highlight.
 * @param enable True to enable highlighting, false to disable.
 * @param isClickHighlight True if it's a click highlight, false for hover highlight.
 */
export function applyCharacterHighlight(
  character: RunningCharacter,
  enable: boolean,
  isClickHighlight: boolean,
  activeInformation: ActiveInformation,
  currentInformation: CurrentInformation
) {
  if (
    !currentInformation.currentBookGroup ||
    !currentInformation.currentZoomedG
  ) {
    console.error("currentBookGroup or currentZoomedG not initialized!");
    return;
  }

  const className = `link-char-${character.id}`;
  const legendItemGroupClass = `legend-item-group-${character.id}`;

  if (enable) {
    currentInformation.currentZoomedG
      .selectAll(`path.link`)
      .attr("opacity", 0.05);
    currentInformation.currentZoomedG
      .selectAll(`path.link-pattern`)
      .attr("opacity", 0.05);
    currentInformation.currentBookGroup.style("opacity", 0.2);
    d3.selectAll(".legend-item-group").classed(
      "highlighted-legend-item",
      false
    );
    d3.selectAll(".legend-item-group").classed("dimmed-legend-item", true);

    currentInformation.currentZoomedG
      .selectAll(`.${className}`)
      .attr("opacity", 1)
      .raise();
    currentInformation.currentZoomedG
      .selectAll(`.${className}.link-pattern`)
      .attr("opacity", 1)
      .raise();
    d3.select(`.${legendItemGroupClass}`).classed(
      "highlighted-legend-item",
      true
    );
    d3.select(`.${legendItemGroupClass}`).classed("dimmed-legend-item", false);

    const relevantBookIds = character.books.map((b) => `book-${b.id}`);
    currentInformation.currentBookGroup.each(function (bookPos: BookPosition) {
      if (relevantBookIds.includes(bookPos.id)) {
        d3.select(this).style("opacity", 1);
      }
    });
  } else {
    deactivateActiveHighlight(activeInformation, currentInformation);
  }

  if (isClickHighlight) {
    activeInformation.activeCharachterId = enable ? character.id : null;
    activeInformation.activeLegendType = enable ? "character" : null;
  }
}

/**
 * Determines the color or pattern ID for a character.
 * @param character The character.
 * @param type 'fill' for fill color (legend rectangle), 'stroke' for stroke color (edge).
 * @returns CSS color value or URL to SVG pattern.
 */
export function getCharacterDisplayColor(
  character: RunningCharacter,
  type: "fill" | "stroke"
): string {
  const charColorName = character.color;

  if (Object.prototype.hasOwnProperty.call(customColors, charColorName)) {
    const color = customColors[charColorName as SimpleColorName];
    console.log("know Color (" + color + ")  for " + character.name);
    return color;
  }

  const patternId = `pattern-${charColorName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")}`;
  const patternDef = patternDefinitions.find((p) => p.id === patternId);

  if (patternDef) {
    if (type === "stroke") {
      return patternDef.colors.primary;
    } else {
      return `url(#${patternDef.id})`;
    }
  }

  if (character.books && character.books.length > 0) {
    const firstBook = discworldData.books.find(
      (book) => book.id === character.books[0].id
    );
    if (firstBook && firstBook.serie) {
      const serie = firstBook.serie;
      const color = serieColors[serie];
      if (color !== undefined) {
        return color;
      }
    }
  }
  return "#00FF00";
}
