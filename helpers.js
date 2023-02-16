import slugify from "slugify";

export function formatAndScaleValue(value, oblastKey, oblastScales) {
  // Get the proper scale for this oblast name
  const scale = oblastScales ? oblastScales[oblastKey] : 1;

  // If the scale is undefined, set it to 1
  const sliderScale = (scale >= 0 ? scale : 1);

  // Return the value scaled by the sliderScale
  return formatValue(value * sliderScale);
}

export function formatValue(value) {
  return (+value).toFixed(1);
}

// We use the spelling from the data set - NOT the map property data
function standardizeOblastSpelling(oblastName) {
  switch (oblastName) {
    // TODO crimea / sevastopal are missing due to russian occupation.
    case "khmelnytskyy":
      return "khmelnytskiy";
    case "kiev":
      return "kyiv";
    case "kiev-city":
      return "kyiv";
    case "odessa":
      return "odesa";
    case "mykolayiv":
      return "mikolayiv";
    case "transcarpathia":
      return "zakarpattya";
    default:
      return oblastName
  }
}

// Normalize our oblast name using slugify
export function normalizeOblastName(key) {
  if (!key) return key;
  return standardizeOblastSpelling(
    slugify(key, {
      strict: true,
      lower: true,
    })
  );
}
