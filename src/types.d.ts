export type DiscworldData = {
  books: Book[];
  characters: RunningCharacter[];
};

export type Book = {
  id: number;
  name: string;
  serie: Serie;
  genres: Genre[];
};

// 27:22
export type Genre =
  | "Parody"
  | "Adventure"
  | "Satire"
  | "Buddy Comedy"
  | "Coming of age"
  | "Drama"
  | "Action"
  | "Crime"
  | "Mystery"
  | "Slice of Life"
  | "Fairytale"
  | "Holiday"
  | "Horror"
  | "Thriller"
  | "Time Travel"
  | "Military Fiction"
  | "School Story"
  | "Heist"
  | "Sports";

// 29:44
export type Serie =
  | "Wizards" // Purple /   8 / 1,2,5,9,17,22,27,37
  | "Witches" // Green  /   6 / 3,6,12,14,18,23
  | "Death" // Black  /   5 / 4,11,16,20,26
  | "One Offs" // Yellow /   4 / 7,13,28,31
  | "Guards" // Orange /   9 / 8,15,19,21,24,29,34,39
  | "Something new comes" // Pink   /   2 / 10,25
  | "Tiffany Aching" // Blue   /   5 / 30,32,35,38,41
  | "Industrial Revolution"; // Red    /   3 / 33,36,40

type SimpleColorName =
  | "LightPurple"
  | "Orange"
  | "Purple"
  | "Blue"
  | "DarkGrey"
  | "Black"
  | "Pink"
  | "LightBlue"
  | "Gold"
  | "Red"
  | "Yellow"
  ;
type ColorPattern = "GreenYellowDotted" | "WhiteRedDotted";
type ColorName = SimpleColorName | ColorPattern;

// 47:09
export type RunningCharacter = {
  id: number;
  name: string;
  members?: string[];
  color: ColorName;
  books: Book[];
};
