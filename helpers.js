export function formatAndScaleValue(value, oblastNameUkrainian, scaleByOblast) {
  // default to 100% if missing from scaleByOblast map
  if(scaleByOblast) {
    const scale = scaleByOblast.value[oblastNameUkrainian];
  } else {
    const scale = 100;
  }
  const sliderScale = (scale >= 0 ? scale : 100) / 100;
  return formatValue(value * sliderScale);
}

function formatValue(value) {
  return (+value).toFixed(1);
}
