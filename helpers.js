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
