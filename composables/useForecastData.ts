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

// Takes the original data and applies all scenarios to it using formatAndScaleValue
function forecastDataByGrainType(dataByGrainType, oblastScales) {
  const forecastedData = new Map();
  
  for (const [grainType, oblasts] of dataByGrainType) {
    if (!oblasts) continue;
    forecastedData.set(
      grainType,
      oblasts.map((oblast) => {
        // const forecastScale = oblastForecastScale[oblast.oblastNameEnglish] || forecastSelectOptions[0].scaleValue
        return {
          ...oblast,
          harvestedAreaOriginal: formatValue(oblast.harvestedArea),
          grainYieldOriginal: formatValue(oblast.grainYield),
          volumeOriginal: formatValue(oblast.volume),
          harvestedArea: formatAndScaleValue(
            oblast.harvestedArea,
            oblast.oblastNameUkrainian,
            oblastScales,
          ),
          grainYield: formatAndScaleValue(
            oblast.grainYield,
            oblast.oblastNameUkrainian,
            oblastScales
          ),
          volume: formatAndScaleValue(
            oblast.volume,
            oblast.oblastNameUkrainian,
            oblastScales
          ),
        };
      })
    );
  }
  return forecastedData;
}

export async function useForecastData({ oblastScales }) {
  // fetch the forecast data from the json file
  const dataByGrainType = await useDataByGrainType();
  // get our grain data from all_data and then apply the scenario to it with forecastDataByGrainType
  return forecastDataByGrainType(dataByGrainType, oblastScales)
}