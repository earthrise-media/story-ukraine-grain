export function formatAndScaleValue(value, oblastNameEnglish, scaleByOblast) {
  // default to 100% if missing from scaleByOblast map

  let scale = 100
  if(scaleByOblast) {
    // scale = scaleByOblast.value[oblastNameEnglish];
    scale = scaleByOblast[oblastNameEnglish];
  }
  const sliderScale = (scale >= 0 ? scale : 100) / 100;
  return formatValue(value * sliderScale);
}

export function formatValue(value) {
  return (+value).toFixed(1);
}
