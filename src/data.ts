import type { Book, DiscworldData, RunningCharacter, Serie, SimpleColorName } from "./types";

const books: Book[] = [
  {
    id: 1,
    name: "The Colour of Magic",
    serie: "Wizards",
    genres: ["Parody", "Adventure"],
  },
  {
    id: 2,
    name: "The Light Fantastic",
    serie: "Wizards",
    genres: ["Parody", "Adventure"],
  },
  {
    id: 3,
    name: "Equal Rites",
    serie: "Witches",
    genres: ["Buddy Comedy", "Satire"],
  },
  {
    id: 4,
    name: "Mort",
    serie: "Death",
    genres: ["Adventure", "Coming of age"],
  },
  {
    id: 5,
    name: "Sourcery",
    serie: "Wizards",
    genres: ["Adventure", "Coming of age"],
  },
  {
    id: 6,
    name: "Wyrd Sisters",
    serie: "Witches",
    genres: ["Parody", "Drama"],
  },
  {
    id: 7,
    name: "Pyramids",
    serie: "One Offs",
    genres: ["Coming of age", "Action"],
  },
  {
    id: 8,
    name: "Guards! Guards!",
    serie: "Guards",
    genres: ["Crime", "Mystery"],
  },
  {
    id: 9,
    name: "-Faust- Eric",
    serie: "Wizards",
    genres: ["Parody", "Adventure"],
  },
  {
    id: 10,
    name: "Moving Pictures",
    serie: "Something new comes",
    genres: ["Parody", "Satire"],
  },
  {
    id: 11,
    name: "Reaper Man",
    serie: "Death",
    genres: ["Slice of Life", "Satire"],
  },
  {
    id: 12,
    name: "Witches Abroad",
    serie: "Witches",
    genres: ["Buddy Comedy", "Fairytale"],
  },
  {
    id: 13,
    name: "Small Gods",
    serie: "One Offs",
    genres: ["Buddy Comedy", "Satire"],
  },
  {
    id: 14,
    name: "Lords And Ladies",
    serie: "Witches",
    genres: ["Fairytale", "Drama"],
  },
  {
    id: 15,
    name: "Men at Arms",
    serie: "Guards",
    genres: ["Crime", "Mystery"],
  },
  {
    id: 16,
    name: "Soul Music",
    serie: "Death",
    genres: ["Parody", "Satire"],
  },
  {
    id: 17,
    name: "Interesting Times",
    serie: "Wizards",
    genres: ["Parody", "Adventure"],
  },
  {
    id: 18,
    name: "Maskerade",
    serie: "Witches",
    genres: ["Parody", "Drama"],
  },
  {
    id: 19,
    name: "Feet of Clay",
    serie: "Guards",
    genres: ["Crime", "Mystery"],
  },
  {
    id: 20,
    name: "Hogfather",
    serie: "Death",
    genres: ["Holiday", "Satire"],
  },
  {
    id: 21,
    name: "Jingo",
    serie: "Guards",
    genres: ["Action", "Satire"],
  },
  {
    id: 22,
    name: "The Last Continent",
    serie: "Wizards",
    genres: ["Adventure", "Parody"],
  },
  {
    id: 23,
    name: "Carpe Jugulum",
    serie: "Witches",
    genres: ["Horror", "Drama"],
  },
  {
    id: 24,
    name: "The Fifth Elephant",
    serie: "Guards",
    genres: ["Mystery", "Thriller"],
  },
  {
    id: 25,
    name: "The Truth",
    serie: "Something new comes",
    genres: ["Mystery", "Thriller"],
  },
  {
    id: 26,
    name: "Thief of Time",
    serie: "Death",
    genres: ["Time Travel", "Coming of age"],
  },
  {
    id: 27,
    name: "The Last Hero",
    serie: "Wizards",
    genres: ["Adventure", "Action"],
  },
  {
    id: 28,
    name: "The Amazing Maurice",
    serie: "One Offs",
    genres: ["Mystery", "Horror"],
  },
  {
    id: 29,
    name: "Night Watch",
    serie: "Guards",
    genres: ["Time Travel", "Action"],
  },
  {
    id: 30,
    name: "The Wee Free Men",
    serie: "Tiffany Aching",
    genres: ["Coming of age", "Fairytale"],
  },
  {
    id: 31,
    name: "Monstrous Regiment",
    serie: "One Offs",
    genres: ["Military Fiction", "Satire"],
  },
  {
    id: 32,
    name: "A Hat Full of Sky",
    serie: "Tiffany Aching",
    genres: ["Coming of age", "School Story"],
  },
  {
    id: 33,
    name: "Going Postal",
    serie: "Industrial Revolution",
    genres: ["Heist", "Thriller"],
  },
  {
    id: 34,
    name: "Thud!",
    serie: "Guards",
    genres: ["Mystery", "Thriller"],
  },
  {
    id: 35,
    name: "Wintersmith",
    serie: "Tiffany Aching",
    genres: ["Coming of age", "School Story"],
  },
  {
    id: 36,
    name: "Making Money",
    serie: "Industrial Revolution",
    genres: ["Heist", "Thriller"],
  },
  {
    id: 37,
    name: "Unseen Academicals",
    serie: "Wizards",
    genres: ["Sports", "Satire"],
  },
  {
    id: 38,
    name: "I Shall Wear Midnight",
    serie: "Tiffany Aching",
    genres: ["Coming of age", "Horror"],
  },
  {
    id: 39,
    name: "Snuff",
    serie: "Guards",
    genres: ["Mystery", "Thriller"],
  },
  {
    id: 40,
    name: "Raising Steam",
    serie: "Industrial Revolution",
    genres: ["Heist", "Action"],
  },
  {
    id: 41,
    name: "The Shepherd's Crown",
    serie: "Tiffany Aching",
    genres: ["Drama", "Coming of age"],
  },
];

const characters: RunningCharacter[] = [
  {
    id: 1,
    name: "Mort and Isabelle",
    color: "Black",
    books: [
        books[3],
        books[15],
    ]
  },
  {
    id: 2,
    name: "Eskarina Smith",
    color: "Pink",
    books: [
        books[2],
        books[37],
    ]
  },
  {
    id: 3,
    name: "Twoflower",
    color: "Pink",
    books: [
        books[0],
        books[1],
        books[16]
    ]
  },
  {
    id: 4,
    name: "Lobsang Ludd",
    color: "LightBlue",
    books: [
        books[12],
        books[25],
        books[28]
    ]
  },  {
    id: 5,
    name: "Susan Sto Helit",
    color: "Black",
    books: [
        books[15],
        books[19],
        books[25]
    ]
  }, {
    id: 6,
    name: "Queen of the Elves",
    color: "Purple",
    books: [
        books[13],
        books[29],
        books[40]
    ]
  },{
    id: 7,
    name: "Postman crew",
    members: [
        "Moist von Lipwig", 
        "Stanley Howler", 
        "Tolliver Groat", 
        "Adora Belle Dearheart",
    ],
    color: "GreenYellowDotted",
    books: [
        books[32],
        books[35],
        books[39]
    ]
  },{
    id: 8,
    name: "Cohen the Barbarian",
    color: "Gold",
    books: [
        books[1],
        books[16],
        books[20],
        books[26]
    ]
  },{
    id: 9,
    name: "Newspaper crew",
    members: [
        "William de Worde", 
        "Sacharissa Cripslock", 
        "Otto von Chriek",
    ],
    color: "GreenYellowDotted",
    books: [
        books[24],
        books[30],
        books[32],
        books[35],
        books[39]
    ]
  },{
    id: 10,
    name: "Tiffany Aching",
    color: "LightPurple",
    books: [
        books[29],
        books[31],
        books[34],
        books[37],
        books[40]
    ]
  },{
    id: 11,
    name: "Pictsies / Nac Mac Feegle",
    members: [
        "Wee Mad Arthur"
    ],
    color: "Blue",
    books: [
        books[22],
        books[29],
        books[31],
        books[34],
        books[37],
        books[40]
    ]
  },{
    id: 12,
    name: "Gaspode the Wonder Dog",
    color: "Red",
    books: [
        books[9],
        books[14],
        books[15],
        books[18],
        books[19],
        books[23],
        books[24]
    ]
  },{
    id: 13,
    name: "Leonard of Quirm",
    color: "LightBlue",
    books: [
        books[5],
        books[14],
        books[15],
        books[20],
        books[23],
        books[24],
        books[26],
        books[30]
    ]
  },{
    id: 14,
    name: "Rincewind",
    color: "Purple",
    books: [
        books[0],
        books[1],
        books[4],
        books[8],
        books[16],
        books[21],
        books[26],
        books[36]
    ]
  },{
    id: 15,
    name: "Death of Rats / The Grim Squeaker",
    color: "Red",
    books: [
        books[10],
        books[12],
        books[15],
        books[17],
        books[19],
        books[21],
        books[22],
        books[25],
        books[27]
    ]
  },{
    id: 16,
    name: "The Witches",
    members: [
        "Granny Weatherwax", "Nanny Ogg", "Magrat Garlic", "Agnes Nitt"
    ],
    color: "Purple",
    books: [
        books[2],
        books[5],
        books[11],
        books[13],
        books[17],
        books[22],
        books[29],
        books[34],
        books[36],
        books[40]
    ]
  },{
    id: 17,
    name: "Cut-Me-Own-Throat Dibbler",
    color: "Orange",
    books: [
        books[7],
        books[9],
        books[15],
        books[18],
        books[20],
        books[24],
        books[28],
        books[35],
        books[36],
        books[40]
    ]
  },{
    id: 18,
    name: "City Watch",
    members: [
        "Samuel Vimes", 
        "Carrot Ironfoundersson", 
        "Nobby Nobbs", 
        "Fred Colon", 
        "Lady Sybil Ramkin", 
        "Angua von Überwald", 
        "Detritus", 
        "Cheery Littlebottom", 
        "Dorfl"
    ],
    color: "Yellow",
    books: [
        books[7],
        books[14],
        books[18],
        books[28],
        books[20],
        books[23],
        books[32],
        books[35],
        books[36],
        books[38],
        books[39],
        books[30],
        books[37],
    ]
  },{
    id: 19,
    name: "Lord Vetinari",
    color: "DarkGrey",  // White is not possible here
    books: [
        books[0],
        books[1],
        books[7],
        books[9],
        books[10],
        books[14],
        books[15],
        books[16],
        books[18],
        books[20],
        books[23],
        books[24],
        books[26],
        books[28],
        books[32],
        books[33],
        books[35],
        books[38],
        books[36],
        books[39],
        books[40]
    ]
  },{
    id: 20,
    name: "Wizards",
    members: [
        "The Archchancellor Mustrum Ridcully", 
        "The Dean of Pentacles", 
        "Bursar A.A. Dinwiddie", 
        "The Librarian", 
        "Ponder Stibbons", 
        "Hex",
    ],
    color: "WhiteRedDotted",
    books: [
        books[0],
        books[1],
        books[2],
        books[4],
        books[7],
        books[8],
        books[9],
        books[10],
        books[13],
        books[14],
        books[15],
        books[16],
        books[17],
        books[18],
        books[19],
        books[20],
        books[21],
        books[24],
        books[26],
        books[28],
        books[32],
        books[33],
        books[35],
        books[36],        
        books[39],        
        books[40]
    ]
  },{
    id: 21,
    name: "Death",
    color: "Black",
    books: [
        books[0],
        books[1],
        books[2],
        books[3],
        books[4],
        books[5],
        books[6],
        books[7],
        books[8],
        books[9],
        books[10],
        books[11],
        books[12],
        books[13],
        books[14],
        books[15],
        books[16],
        books[17],
        books[18],
        books[19],
        books[20],
        books[21],
        books[22],
        books[23],
        books[24],
        books[25],
        books[26],
        books[27],
        books[28],
        // NOT Wee Free Men
        books[30],
        books[31],
        books[32],
        books[33],
        books[34],
        books[35],
        books[36],
        books[37],
        // NOT Snuff        
        books[39],        
        books[40]
    ]
  },
];

const discworldData: DiscworldData = {
  books,
  characters,
};



export const serieColors: Record<Serie, string> = {
  Wizards: "#800080", // Purple
  Witches: "#008000", // Green
  Death: "#000000", // Black
  "One Offs": "#FFFF00", // Yellow
  Guards: "#FFA500", // Orange
  "Something new comes": "#FFC0CB", // Pink
  "Tiffany Aching": "#0000FF", // Blue
  "Industrial Revolution": "#FF0000", // Red
};

export const customColors: Record<SimpleColorName, string> = {
  "LightPurple": "#b19cd9",
  "Orange": "#FFA500", 
  "Purple": "#800080",
  "Blue": "#0000FF", 
  "DarkGrey": "#7f8c8d", 
  "Black": "#000000", 
  "Pink": "#FFC0CB", 
  "LightBlue": "#ADD8E6", 
  "Gold": "#FFD700", 
  "Red": "#FF0000",
  "Yellow": "#FFFF00", 
};

export const patternDefinitions = [
  { id: "pattern-white-red-dotted", type: "dotted", colors: { primary: "white", secondary: "red" } },
  { id: "pattern-green-yellow-dotted", type: "dotted", colors: { primary: "green", secondary: "yellow" } },
];

export default discworldData;
