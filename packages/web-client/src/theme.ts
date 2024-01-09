import { createTheme } from "@mui/material";

/* Main Primary color */
export const primary0 = "#343477";
// const primary1 = "#8080B3";
const primary2 = "#565695";
// const primary3 = "#1A1A59";
const primary4 = "#09093B";

/* Main Secondary color (1) */
const secondary1n0 = "#AAA039";
// const secondary1n1 = "#FFF7AA";
// const secondary1n2 = "#D4CB6A";
const secondary1n3 = "#807615";
// const secondary1n4 = "#554D00";

/* Main Secondary color (2) */
// const secondary2n0 = "#AA7939";
// const secondary2n1 = "#FFDBAA";
// const secondary2n2 = "#D4A76A";
// const secondary2n3 = "#805215";
// const secondary2n4 = "#553100";

export const themeColors = [
  "#343477",
  "#8080B3",
  "#565695",
  "#1A1A59",
  "#09093B",
  "#AAA039",
  "#D4CB6A",
  "#807615",
  "#554D00",
  "#AA7939",
  "#D4A76A",
  "#805215",
  "#553100",
];

const paper = "#fafaff";
const bg = "#d6d6d6";
export const theme2 = createTheme({
  palette: {
    background: { default: bg, paper },
    info: {
      main: primary2,
    },
    primary: {
      main: secondary1n0,
      "100": "#c4bd75",
      "200": "#c4bd75",
      "300": "#c4bd75",
      "400": "#ceca9d",
      "50": "#c4bd75",
      "500": "#ceca9d",
      "600": "#ceca9d",
      "700": "#ceca9d",
      "800": "#dad7bb",
      "900": "#dad7bb",
      A100: secondary1n3,
      A200: secondary1n3,
      A400: secondary1n3,
      A700: secondary1n3,
    },
  },
  typography: {
    h1: {
      fontStyle: "'Comfortaa', sans-serif",
      fontSize: "2rem",
    },
  },
});

export const theme1 = createTheme({
  palette: {
    background: { default: bg, paper },
    info: {
      main: primary2,
    },
    primary: {
      main: primary0,
      "100": "#efeffa",
      "200": "#efeffa",
      "300": "#efeffa",
      "400": "#6969b3",
      "50": "#efeffa",
      "500": "#6969b3",
      "600": "#6969b3",
      "700": "#6969b3",
      "800": "#8080d4",
      "900": "#8080d4",
      A100: primary4,
      A200: primary4,
      A400: primary4,
      A700: primary4,
    },
  },
  typography: {
    h1: { fontSize: "2.5rem", fontFamily: "'Exo 2', sans-serif" },
    body1: { fontFamily: "'Hind', sans-serif" },
    body2: { fontFamily: "'Hind', sans-serif" },
    allVariants: { fontFamily: "'Hind', sans-serif" },
  },
});
export const themes = [theme1, theme2];
