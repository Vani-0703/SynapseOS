import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { base:"#15141B",panel:"#1E1D27",panelRaised:"#252430",hairline:"#34333F",signal:{DEFAULT:"#E3A857",dim:"#8A6C3E"},knowledge:{DEFAULT:"#5C86A6",dim:"#3E5A70"},wine:"#A8455B",sage:"#7EA37F",ink:{primary:"#EEEAE2",muted:"#9A97A3",faint:"#615F6B"} },
    fontFamily:{sans:["'IBM Plex Sans'","system-ui","sans-serif"],mono:["'IBM Plex Mono'","ui-monospace","monospace"]},
    borderRadius:{none:"0px",sm:"2px",DEFAULT:"3px",panel:"4px"}
  }},
  plugins:[]
};
export default config;