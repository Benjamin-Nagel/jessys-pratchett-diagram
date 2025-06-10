import * as d3 from "d3";

import type { Book, Genre, RunningCharacter, Serie } from "../../types";

import discworldData, { serieColors } from "../../data";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: "book" | "character" | "genre" | "serie_center";
  name: string;
  data?: Book | RunningCharacter | Serie | Genre;
  serie?: Serie;
  genre?: Genre;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode;
  target: GraphNode;
  type: "book_character" | "book_genre" | "book_serie";
}

const symbolGenerator = d3.symbol().size(220);

export function createGraph(selector: string) {
  const svgElement = document.querySelector<SVGSVGElement>(selector);
  if (!svgElement) {
    console.error(`SVG element with selector ${selector} not found.`);
    return;
  }

  const width = svgElement.clientWidth;
  const height = svgElement.clientHeight;

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("pointer-events", "none");

  const svgContainer = d3
    .select(selector)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const g = svgContainer.append("g");

  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 8])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
  svgContainer.call(zoomBehavior);

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const bookNodeMap = new Map<number, GraphNode>();
  const charNodeMap = new Map<string, GraphNode>();
  const genreNodeMap = new Map<Genre, GraphNode>();
  const serieCenterNodeMap = new Map<Serie, GraphNode>();

  Object.keys(serieColors).forEach((s) => {
    const serieName = s as Serie;
    if (!serieCenterNodeMap.has(serieName)) {
      const serieCenterNode: GraphNode = {
        id: `serie-center-${serieName}`,
        type: "serie_center",
        name: serieName,
        data: serieName,
      };
      nodes.push(serieCenterNode);
      serieCenterNodeMap.set(serieName, serieCenterNode);
    }
  });

  discworldData.books.forEach((book) => {
    const bookNode: GraphNode = {
      id: `book-${book.id}`,
      type: "book",
      name: book.name,
      data: book,
      serie: book.serie,
    };
    nodes.push(bookNode);
    bookNodeMap.set(book.id, bookNode);

    const serieCenterNode = serieCenterNodeMap.get(book.serie);
    if (serieCenterNode) {
      links.push({
        source: bookNode,
        target: serieCenterNode,
        type: "book_serie",
      });
    }
  });

  discworldData.characters.forEach((char) => {
    const charId = char.id
      ? String(char.id)
      : `character-${char.name.replace(/\s+/g, "-")}`;

    let charNode = charNodeMap.get(charId);
    if (!charNode) {
      charNode = {
        id: charId,
        type: "character",
        name: char.name,
        data: char,
      };
      nodes.push(charNode);
      charNodeMap.set(charId, charNode);
    }

    char.books.forEach((book) => {
      const bookNode = bookNodeMap.get(book.id);
      if (bookNode) {
        links.push({
          source: charNode,
          target: bookNode,
          type: "book_character",
        });
      }
    });
  });

  discworldData.books.forEach((book) => {
    book.genres.forEach((genre) => {
      if (!genreNodeMap.has(genre)) {
        const genreNode: GraphNode = {
          id: `genre-${genre}`,
          type: "genre",
          name: genre,
          data: genre,
          genre: genre,
        };
        nodes.push(genreNode);
        genreNodeMap.set(genre, genreNode);
      }
      const genreNode = genreNodeMap.get(genre)!;
      const bookNode = bookNodeMap.get(book.id);
      if (bookNode) {
        links.push({
          source: bookNode,
          target: genreNode,
          type: "book_genre",
        });
      }
    });
  });

  const simulation = d3
    .forceSimulation<GraphNode, GraphLink>(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance((d) => {
          if (d.type === "book_serie") return 50;
          if (d.type === "book_character") return 80;
          if (d.type === "book_genre") return 60;
          return 100;
        })
    )
    .force("charge", d3.forceManyBody().strength(-300)) // ZURÜCK AUF -300!
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collide",
      d3
        .forceCollide<GraphNode>()
        .radius((d) => {
          if (d.type === "book") return 25;
          if (d.type === "character") return 20;
          if (d.type === "genre") return 15;
          if (d.type === "serie_center") return 40;
          return 10;
        })
        .iterations(1) 
    );

  const link = g
    .append("g")
    .attr("stroke", "#999")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => (d.type === "book_serie" ? 2 : 1))
    .attr("stroke", (d) => {
      if (d.type === "book_serie") {
        const bookNode = d.source.type === "book" ? d.source : d.target;
        return serieColors[bookNode.serie as Serie] || "#999";
      }
      if (d.type === "book_character")
        return (d.source.data as RunningCharacter)?.color || "#999";
      if (d.type === "book_genre") return "lightgray";
      return "#999";
    });

  const node = g
    .append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", (d) => d.type)
    .style("cursor", "pointer")
    .call(drag(simulation) as any);

  node
    .filter((d) => d.type === "book")
    .append("circle")
    .attr("r", 15)
    .attr("fill", (d) =>
      d.serie && serieColors[d.serie] ? serieColors[d.serie] : "#69b3a2"
    );
  node
    .filter((d) => d.type === "character")
    .append("path")
    .attr("d", symbolGenerator.type(d3.symbolDiamond))
    .attr("fill", (d) => (d.data as RunningCharacter).color || "#69b3a2");
  node
    .filter((d) => d.type === "genre")
    .append("path")
    .attr("d", symbolGenerator.type(d3.symbolTriangle).size(100))
    .attr("fill", "lightgray");
  node
    .filter((d) => d.type === "serie_center")
    .append("rect")
    .attr("width", 40)
    .attr("height", 40)
    .attr("x", -20)
    .attr("y", -20)
    .attr("rx", 4)
    .attr("fill", (d) => serieColors[d.name as Serie] || "grey");

  const allShapes = node
    .selectAll("circle, path, rect")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);

  const labels = g
    .append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text((d) => d.name)
    .attr("font-size", (d) => (d.type === "serie_center" ? "14px" : "10px"))
    .attr("fill", (d) =>
      d.type === "serie_center" ? "black" : "darkslategray"
    )
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("dy", (d) => {
      if (d.type === "serie_center") return -25;
      if (d.type === "book") return 25;
      if (d.type === "genre" || d.type === "character") return 20;
      return 18;
    });

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x!)
      .attr("y1", (d) => d.source.y!)
      .attr("x2", (d) => d.target.x!)
      .attr("y2", (d) => d.target.y!);
    node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
  });

  function drag(simulation: d3.Simulation<GraphNode, GraphLink>) {
    function dragstarted(
      event: d3.D3DragEvent<SVGElement, GraphNode, GraphNode>
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    function dragged(event: d3.D3DragEvent<SVGElement, GraphNode, GraphNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    function dragended(
      event: d3.D3DragEvent<SVGElement, GraphNode, GraphNode>
    ) {
      if (!event.active) simulation.alphaTarget(0);
    }
    return d3
      .drag<SVGGElement, GraphNode>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  // --- Legenden ---
  function toggleLegendVisibility(
    legendGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    contentGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    toggleButton: d3.Selection<SVGTSpanElement, unknown, HTMLElement, any>
  ) {
    const isHidden = contentGroup.classed("hidden-content");
    contentGroup.classed("hidden-content", !isHidden);
    toggleButton.text(isHidden ? "−" : "+");
    updateLegendPositions(); 
  }

  function updateLegendPositions() {
    let currentRightY = 80; 
    const padding = 30;

    const leftLegend = svgContainer.select(".left-legend");

    const rightSerieLegend = svgContainer.select(".serie-legend");
    if (!rightSerieLegend.empty()) {
      rightSerieLegend.attr(
        "transform",
        `translate(${width - 180}, ${currentRightY})`
      );
      const serieContentHeight =
        rightSerieLegend.select(".legend-content").node()?.getBBox().height ||
        0;
      const serieTitleHeight =
        rightSerieLegend.select(".legend-title").node()?.getBBox().height || 0;
      if (
        !rightSerieLegend.select(".legend-content").classed("hidden-content")
      ) {
        currentRightY += serieTitleHeight + serieContentHeight + padding;
      } else {
        currentRightY += serieTitleHeight + padding;
      }
    }

    const rightGenreLegend = svgContainer.select(".genre-legend");
    if (!rightGenreLegend.empty()) {
      rightGenreLegend.attr(
        "transform",
        `translate(${width - 180}, ${currentRightY})`
      );
    }
  }

  const typeLegendData = [
    { name: "Book", type: "book" },
    { name: "Character", type: "character" },
    { name: "Genre", type: "genre" },
    { name: "Serie", type: "serie_center" },
  ];
  const topLegend = svgContainer
    .append("g")
    .attr("class", "legend top-legend")
    .attr(
      "transform",
      `translate(${width / 2 - (typeLegendData.length * 90) / 2}, 20)`
    );

  typeLegendData.forEach((item, i) => {
    const legendItem = topLegend
      .append("g")
      .attr("transform", `translate(${i * 90}, 0)`) // Horizontal anordnen
      .attr("class", `legend-item type-legend-item`)
      .attr("data-type", item.type);

    const shapeGroup = legendItem
      .append("g")
      .attr("transform", "translate(7.5, 7.5)");
    if (item.type === "book") {
      shapeGroup.append("circle").attr("r", 8).attr("fill", "gray");
    } else if (item.type === "character") {
      shapeGroup
        .append("path")
        .attr("d", d3.symbol().type(d3.symbolDiamond).size(100))
        .attr("fill", "gray");
    } else if (item.type === "genre") {
      shapeGroup
        .append("path")
        .attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
        .attr("fill", "lightgray");
    } else if (item.type === "serie_center") {
      shapeGroup
        .append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("x", -7)
        .attr("y", -7)
        .attr("rx", 4)
        .attr("fill", "darkgrey");
    }
    legendItem
      .append("text")
      .attr("x", 24)
      .attr("y", 12)
      .text(item.name)
      .attr("fill", "black")
      .style("font-size", "12px");
  });

  const characterLegendData = discworldData.characters.filter(
    (char) => char.color
  );
  const leftLegend = svgContainer
    .append("g")
    .attr("class", "legend left-legend")
    .attr("transform", "translate(20, 80)");

  const leftLegendTitle = leftLegend
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text("Main Characters: ")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("cursor", "pointer");

  const leftLegendToggleButton = leftLegendTitle
    .append("tspan")
    .attr("class", "toggle-button")
    .style("font-size", "14px")
    .text("−");

  const leftLegendContent = leftLegend
    .append("g")
    .attr("class", "legend-content");

  leftLegendTitle.on("click", function () {
    toggleLegendVisibility(
      leftLegend,
      leftLegendContent,
      leftLegendToggleButton
    );
  });

  characterLegendData.forEach((char, i) => {
    const legendItem = leftLegendContent 
      .append("g")
      .attr("transform", `translate(0, ${20 + i * 20})`)
      .attr("class", "legend-item character-legend-item")
      .attr("data-character-name", char.name)
      .attr(
        "data-node-id",
        char.id
          ? String(char.id)
          : `character-${char.name.replace(/\s+/g, "-")}`
      );

    legendItem
      .append("path")
      .attr("d", d3.symbol().type(d3.symbolDiamond).size(64))
      .attr("transform", "translate(7.5, 7.5)")
      .attr("fill", char.color as string);

    legendItem
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(char.name)
      .attr("fill", "black")
      .style("font-size", "12px");
  });

  const rightLegend = svgContainer
    .append("g")
    .attr("class", "legend right-legend"); 

  const serieLegendGroup = rightLegend
    .append("g")
    .attr("class", "serie-legend");
  const serieLegendTitle = serieLegendGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text("Series: ")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("cursor", "pointer");

  const serieLegendToggleButton = serieLegendTitle
    .append("tspan")
    .attr("class", "toggle-button")
    .style("font-size", "14px")
    .text("−");

  const serieLegendContent = serieLegendGroup
    .append("g")
    .attr("class", "legend-content");

  serieLegendTitle.on("click", function () {
    toggleLegendVisibility(
      serieLegendGroup,
      serieLegendContent,
      serieLegendToggleButton
    );
  });

  const serieLegendData = Object.entries(serieColors);
  serieLegendData.forEach(([serie, color], i) => {
    const legendItem = serieLegendContent 
      .append("g")
      .attr("transform", `translate(0, ${20 + i * 20})`)
      .attr("class", `legend-item serie-legend-item`)
      .attr("data-serie", serie)
      .attr("data-node-id", `serie-center-${serie}`);

    legendItem
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color);

    legendItem
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(serie as Serie)
      .attr("fill", "black")
      .style("font-size", "12px");
  });

  const genreLegendGroup = rightLegend
    .append("g")
    .attr("class", "genre-legend");
  const allGenres = new Set<Genre>();
  discworldData.books.forEach((book) => {
    book.genres.forEach((genre) => allGenres.add(genre));
  });
  const genreLegendData = Array.from(allGenres);

  const genreLegendTitle = genreLegendGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 0) 
    .text("Genres: ")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("cursor", "pointer"); 

  const genreLegendToggleButton = genreLegendTitle
    .append("tspan")
    .attr("class", "toggle-button")
    .style("font-size", "14px")
    .text("−");

  const genreLegendContent = genreLegendGroup
    .append("g")
    .attr("class", "legend-content");

  genreLegendTitle.on("click", function () {
    toggleLegendVisibility(
      genreLegendGroup,
      genreLegendContent,
      genreLegendToggleButton
    );
  });

  genreLegendData.forEach((genre, i) => {
    const legendItem = genreLegendContent 
      .append("g")
      .attr("transform", `translate(0, ${20 + i * 20})`) 
      .attr("class", "legend-item genre-legend-item")
      .attr("data-genre", genre)
      .attr("data-node-id", `genre-${genre}`);

    legendItem
      .append("path")
      .attr("d", d3.symbol().type(d3.symbolTriangle).size(64))
      .attr("transform", "translate(7.5, 7.5)")
      .attr("fill", "lightgray");

    legendItem
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(genre)
      .attr("fill", "black")
      .style("font-size", "12px");
  });

  updateLegendPositions();

  const toggleGenresCheckbox = document.getElementById(
    "toggle-genres"
  ) as HTMLInputElement;
  const toggleSeriesCheckbox = document.getElementById(
    "toggle-series"
  ) as HTMLInputElement;

  function updateGenreVisibility() {
    const show = toggleGenresCheckbox ? toggleGenresCheckbox.checked : false;
    node
      .filter((d) => d.type === "genre")
      .style("opacity", show ? 1 : 0)
      .style("pointer-events", show ? "all" : "none"); 
    labels
      .filter((d) => d.type === "genre")
      .style("opacity", show ? 1 : 0)
      .style("pointer-events", show ? "all" : "none");
    link
      .filter((d) => d.type === "book_genre")
      .style("opacity", show ? 1 : 0)
      .style("pointer-events", show ? "all" : "none");
  }

  function updateSeriesVisibility() {
    const show = toggleSeriesCheckbox ? toggleSeriesCheckbox.checked : false;
    node
      .filter((d) => d.type === "serie_center")
      .style("display", show ? "block" : "none");
    labels
      .filter((d) => d.type === "serie_center")
      .style("display", show ? "block" : "none");
    link
      .filter((d) => d.type === "book_serie")
      .style("display", show ? "block" : "none");
  }

  if (toggleGenresCheckbox) {
    toggleGenresCheckbox.addEventListener("change", updateGenreVisibility);
    updateGenreVisibility();
  }
  if (toggleSeriesCheckbox) {
    toggleSeriesCheckbox.addEventListener("change", updateSeriesVisibility);
    updateSeriesVisibility();
  }

  let currentSelectedNodeId: string | null = null;

  function applyHighlight(selectedNode: GraphNode) {
    resetHighlight();

    node.style("opacity", 0.1);
    labels.style("opacity", 0.1);
    link.style("opacity", 0.1);

    const connectedLinks = link.filter(
      (l) => l.source.id === selectedNode.id || l.target.id === selectedNode.id
    );

    const connectedNodeIds = new Set<string>([selectedNode.id]);
    connectedLinks.each((l) => {
      connectedNodeIds.add(l.source.id);
      connectedNodeIds.add(l.target.id);
    });

    connectedLinks
      .attr("stroke", "red")
      .attr("stroke-width", 2.5)
      .style("opacity", 1); 

    node.filter((n) => connectedNodeIds.has(n.id))
      .style("opacity", 1)
      .select("circle, path, rect")
      .attr("stroke", "black")
      .attr("stroke-width", 3);

    labels.filter((l) => connectedNodeIds.has(l.id))
      .style("opacity", 1);

    highlightLegendItem(selectedNode);
  }

  function applyHighlightForLegend(
    highlightedNodes: GraphNode[],
    legendId: string | null = null
  ) {
    resetHighlight();

    node.style("opacity", 0.1);
    labels.style("opacity", 0.1);
    link.style("opacity", 0.1);

    const highlightedNodeIds = new Set<string>(
      highlightedNodes.map((n) => n.id)
    );

    node.filter((n) => highlightedNodeIds.has(n.id)).style("opacity", 1);
    labels.filter((l) => highlightedNodeIds.has(l.id)).style("opacity", 1);

    link
      .filter(
        (l) =>
          highlightedNodeIds.has(l.source.id) &&
          highlightedNodeIds.has(l.target.id)
      )
      .style("opacity", 1)
      .attr("stroke", (d) => {
        if (d.type === "book_serie") {
          const bookNode = d.source.type === "book" ? d.source : d.target;
          return serieColors[bookNode.serie as Serie] || "orange";
        }
        return "orange"; 
      })
      .attr("stroke-width", 2.5);

    highlightedNodes.forEach((n) => {
      node
        .filter((d) => d.id === n.id)
        .select("circle, path, rect")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
    });

    currentSelectedNodeId = legendId;
    highlightLegendItemById(legendId);
  }

  function resetHighlight() {
    node.classed("faded", false).classed("highlighted-border", false);
    labels.classed("faded", false);
    link.classed("faded", false).classed("highlighted", false);

    node.style("opacity", 1);
    labels.style("opacity", 1);
    link.style("opacity", 1);

    allShapes.attr("stroke", "#fff").attr("stroke-width", 1.5);
    link
      .attr("stroke-width", (d) => (d.type === "book_serie" ? 2 : 1))
      .attr("stroke", (d) => {
        if (d.type === "book_serie") {
          const bookNode = d.source.type === "book" ? d.source : d.target;
          return serieColors[bookNode.serie as Serie] || "#999";
        }
        if (d.type === "book_character")
          return (d.source.data as RunningCharacter)?.color || "#999";
        if (d.type === "book_genre") return "lightgray";
        return "#999";
      });
    
    updateGenreVisibility();
    updateSeriesVisibility();

    d3.selectAll(".legend-item")
      .classed("highlighted", false)
      .style("opacity", 1);
  }

  function highlightLegendItem(selectedNode: GraphNode) {
    d3.selectAll(".legend-item")
      .classed("highlighted", false)
      .style("opacity", 0.5);

    let legendItemToHighlight: d3.Selection<
      SVGGElement,
      unknown,
      HTMLElement,
      any
    > | null = null;

    if (selectedNode.type === "character") {
      legendItemToHighlight = d3.selectAll(
        `.character-legend-item[data-node-id='${selectedNode.id}']`
      );
    } else if (selectedNode.type === "serie_center") {
      legendItemToHighlight = d3.selectAll(
        `.serie-legend-item[data-node-id='${selectedNode.id}']`
      );
    } else if (selectedNode.type === "book") {
      if (selectedNode.serie) {
        legendItemToHighlight = d3.selectAll(
          `.serie-legend-item[data-serie='${selectedNode.serie}']`
        );
      }
    } else if (selectedNode.type === "genre") {
      legendItemToHighlight = d3.selectAll(
        `.genre-legend-item[data-node-id='${selectedNode.id}']`
      );
    }
    d3.selectAll(`.type-legend-item[data-type='${selectedNode.type}']`)
      .classed("highlighted", true)
      .style("opacity", 1);

    if (legendItemToHighlight && !legendItemToHighlight.empty()) {
      legendItemToHighlight.classed("highlighted", true).style("opacity", 1);
    } else {
      d3.selectAll(".legend-item").style("opacity", 1);
    }
  }

  function highlightLegendItemById(legendId: string | null) {
    d3.selectAll(".legend-item")
      .classed("highlighted", false)
      .style("opacity", 0.5);
    if (legendId) {
      d3.selectAll(
        `.legend-item[data-node-id='${legendId}'], .legend-item[data-type='${legendId}']`
      )
        .classed("highlighted", true)
        .style("opacity", 1);
    } else {
      d3.selectAll(".legend-item").style("opacity", 1);
    }
  }

  node
    .on("click", function (event, d) {
      event.stopPropagation();
      if (currentSelectedNodeId === d.id) {
        currentSelectedNodeId = null;
        resetHighlight();
        return;
      }
      currentSelectedNodeId = d.id;
      applyHighlight(d); 
    })
    .on("mouseover", function (event, d) {
      if (d3.select(this).style("display") === "none") return;
      let content = `<strong>${d.name}</strong><br/>`;
      if (d.type === "book" && d.data) {
        const book = d.data as Book;
        content += `<p><strong>Serie:</strong> ${
          book.serie
        }</p><p><strong>Genres:</strong> ${
          book.genres.join(", ") || "None"
        }</p>`;
      } else if (d.type === "character" && d.data) {
        const char = d.data as RunningCharacter;
        content += `<p><strong>Type:</strong> Character</p>`;
        if (char.members && char.members.length > 0) {
          content += `<p><strong>Members:</strong> ${char.members.join(
            ", "
          )}</p>`;
        }
        content += `<p><strong>Appears in:</strong> ${char.books.length} book(s)</p>`;
      } else if (d.type === "genre") {
        content += `<p><strong>Type:</strong> Genre</p>`;
      } else if (d.type === "serie_center") {
        content += `<p><strong>Type:</strong> Serie Center</p>`;
      }
      tooltip
        .html(content)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      if (!currentSelectedNodeId) {
        tooltip.style("opacity", 0);
      }
    });

  svgContainer.on("click", function () {
    currentSelectedNodeId = null;
    resetHighlight();
  });

  d3.selectAll(".legend-item")
    .style("cursor", "pointer")
    .on("click", function (event) {
      event.stopPropagation(); 

      const item = d3.select(this);
      const serie = item.attr("data-serie");
      const type = item.attr("data-type");
      const charName = item.attr("data-character-name");
      const genre = item.attr("data-genre");
      const clickedLegendId = item.attr("data-node-id") || type;

      if (currentSelectedNodeId === clickedLegendId) {
        currentSelectedNodeId = null;
        resetHighlight();
        return;
      }

      let nodesToHighlight: GraphNode[] = [];
      if (serie) {
        nodesToHighlight = nodes.filter(
          (n) =>
            n.serie === serie || (n.type === "serie_center" && n.name === serie)
        );
      } else if (type) {
        nodesToHighlight = nodes.filter((d) => d.type === type);
      } else if (charName) {
        const characterNode = nodes.find(
          (d) => d.name === charName && d.type === "character"
        );
        if (characterNode) {
          nodesToHighlight.push(characterNode);
          const connectedBookNodes = links
            .filter(
              (l) =>
                l.type === "book_character" &&
                (l.source.id === characterNode.id ||
                  l.target.id === characterNode.id)
            )
            .map((l) =>
              l.source.id === characterNode.id ? l.target : l.source
            )
            .filter((n) => n.type === "book");
          nodesToHighlight.push(...connectedBookNodes);
        }
      } else if (genre) {
        nodesToHighlight = nodes.filter(
          (d) =>
            (d.type === "genre" && d.name === genre) ||
            (d.type === "book" &&
              (d.data as Book).genres.includes(genre as Genre))
        );
      }

      if (nodesToHighlight.length > 0) {
        applyHighlightForLegend(nodesToHighlight, clickedLegendId);
        currentSelectedNodeId = clickedLegendId;
      }
    })
    .on("mouseover", function (event) {
      if (currentSelectedNodeId) return;
      const item = d3.select(this);
      let content = "";
      if (item.attr("data-serie")) {
        content = `<strong>Serie:</strong> ${item.attr("data-serie")}`;
      } else if (item.attr("data-type")) {
        content = `<strong>Node Type:</strong> ${item.attr("data-type")}`;
      } else if (item.attr("data-character-name")) {
        content = `<strong>Character:</strong> ${item.attr(
          "data-character-name"
        )}`;
      } else if (item.attr("data-genre")) {
        content = `<strong>Genre:</strong> ${item.attr("data-genre")}`;
      }
      tooltip
        .html(content)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      if (!currentSelectedNodeId) {
        tooltip.style("opacity", 0);
      }
    });
}