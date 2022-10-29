export const starColors = {
            "A (Blue-White super giant) Star": "#eaebed",
            "A (Blue-White) Star": "#eaebed",
            "B (Blue-White) Star": "#88d5f0",
            "F (White) Star": "#e6d6a2",
            "F (White super giant) Star": "#e6d6a2",
            "G (White-Yellow) Star": "#f1bf41",
            "G (White-Yellow super giant) Star": "#f1bf41",
            "K (Yellow-Orange) Star": "#f0a632",
            "K (Yellow-Orange giant) Star": "#f0a632",
            "L (Brown dwarf) Star": "#c6433e",
            "M (Red giant) Star": "#ef983f",
            "M (Red dwarf) Star": "#ef983f",
            "S-type Star": "#6c2e3e",
            "T Tauri Star": "#922c44",
            "T (Brown dwarf) Star": "#922c44",
            "Y (Brown dwarf) Star": "#5c1740",
            "White Dwarf (DA) Star": "#edeff0",
            "White Dwarf (DC) Star": "#edeff0",
            "White Dwarf (DAZ) Star": "#edeff0",
            "White Dwarf (DQ) Star": "#edeff0",
            "White Dwarf (D) Star": "#edeff0",
            "Neutron Star": "#fafdfe",
            "": "#626262",
        }

export const customBodies = [
    "Sol",
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    ]

export function deepCopy(data) {
    return JSON.parse(JSON.stringify(data))
}

export const systemScale = 1 / 10000

export function removeTrailingZeroes(value, maximumNumberDecimals=4) {
    const split = value.toFixed(4).split(".")
    const decimals = split[1]
    if (decimals[3] != 0 && maximumNumberDecimals > 3)
        value = value.toFixed(4)
    else if (decimals[2] != 0 && maximumNumberDecimals > 2)
        value = value.toFixed(3)
    else if (decimals[1] != 0 && maximumNumberDecimals > 1)
        value = value.toFixed(2)
    else if (decimals[0] != 0 && maximumNumberDecimals > 0)
        value = value.toFixed(1)
    else
        value = value.toFixed(0)
    return value
}

export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
