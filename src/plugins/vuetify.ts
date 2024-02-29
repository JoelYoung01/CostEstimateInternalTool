// Vuetify
// import "vuetify/styles";
import "@/assets/styles/main.scss";
import { createVuetify, type ThemeDefinition } from "vuetify";

const sodSmithGreen = "#16441C";
const sodSmithGray = "#2a2e32";
const sodSmithLightGreen = "#53a22f";
const sodSmithOffWhite = "#E2DDCE";
const sodSmithWhite = "#eef0f2";

const SodSmithTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: sodSmithGreen,
    background: sodSmithWhite,
    "on-background": sodSmithGreen,
    surface: sodSmithWhite,
    "on-surface": sodSmithGreen,
    secondary: sodSmithLightGreen,
    gray: sodSmithGray,
    offWhite: sodSmithOffWhite
  }
};

const vuetify = createVuetify({
  theme: {
    themes: {
      SodSmithTheme
    }
  }
});

export { SodSmithTheme };
export default vuetify;
