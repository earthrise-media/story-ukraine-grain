// Takes a ukranian oblast and scales it by the value provided
function formatAndScaleValue(value, oblastNameUkrainian, oblastScales) {

  // Get the proper scale for this oblast name
  const scale = oblastScales ? oblastScales[oblastNameUkrainian] : 1;

  // If the scale is undefined, set it to 1
  const sliderScale = (scale >= 0 ? scale : 1);

  // Return the value scaled by the sliderScale
  return formatValue(value * sliderScale);
}

// Takes a number and rounds it so it's not long
function formatValue(value) {
  return (+value).toFixed(1);
}

const scaleGrainData = (grainData, oblastScales) => {
  return grainData.map((oblast) => ({
    ...oblast,
    harvestedAreaOriginal: formatValue(oblast.harvestedArea),
    grainYieldOriginal: formatValue(oblast.grainYield),
    volumeOriginal: formatValue(oblast.volume),
    harvestedArea: formatAndScaleValue(
      oblast.harvestedArea,
      oblast.oblastNameEnglish,
      oblastScales,
    ),
    grainYield: formatAndScaleValue(
      oblast.grainYield,
      oblast.oblastNameEnglish,
      oblastScales
    ),
    volume: formatAndScaleValue(
      oblast.volume,
      oblast.oblastNameEnglish,
      oblastScales
    ),
  }));
}

export function useScaledGrainData() {
  const grainData = useGrainData();
  const { scenario } = useCurrentScenario();

  return computed(() => scaleGrainData(grainData, scenario.value.oblastScales))
}