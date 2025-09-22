import amethystHaze from "./amethyst-haze"
import bubblegum from "./bubblegum"
import caffeine from "./caffeine"
import carbon from "./carbon"
import claymorphism from "./claymorphism"
import cyberpunk from "./cyberpunk"
import evergreen from "./evergreen"
import modernMinimal from "./modern-minimal"
import mono from "./mono"
import pastelDreams from "./pastel-dreams"
import perpetuity from "./perpetuity"
import quantumRose from "./quantum-rose"
import tangerine from "./tangerine"
import theIntern from "./the-intern"
import vintagePaper from "./vintage-paper"

export const tweakcnThemes = [
    amethystHaze,
    bubblegum,
    caffeine,
    carbon,
    claymorphism,
    cyberpunk,
    evergreen,
    modernMinimal,
    mono,
    pastelDreams,
    perpetuity,
    quantumRose,
    tangerine,
    theIntern,
    vintagePaper
]

export type TweakcnConfig = (typeof tweakcnThemes)[number]
