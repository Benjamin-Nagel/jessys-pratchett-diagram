import type { Book, Genre, RunningCharacter, Serie } from "../types";


export interface BookPosition {
  book: Book;
  x: number;
  y: number;
  id: string;
  type: "book";
}

// For force graph
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: "book" | "character" | "genre" | "serie_center";
  name: string;
  data?: Book | RunningCharacter | Serie | Genre;
  serie?: Serie;
  genre?: Genre;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode;
  target: GraphNode;
  type: "book_character" | "book_genre" | "book_serie";
}
