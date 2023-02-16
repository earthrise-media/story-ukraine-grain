// make into composable later
const sortKey = "oblastNameUkrainian"

export async function useSortedData({ oblastScales, grainType }) {
  console.log('✨ useSortedData')
  // const activeGrainTypeIndex = 4

  // fetch the forecast data from the json file
  const forecastedData = await useForecastData({ oblastScales })

  // console.log("👉 forecastedData", forecastedData)
  // get our grain data from all_data and then apply the scenario to it with forecastDataByGrainType
  // const activeGrainType = useActiveGrainType();

  // const dataByGrainType = await useGrainData();
  const dataByGrainType = await useDataByGrainType();
  // console.log("👉 dataByGrainType", dataByGrainType)

  // remove groupings where the key includes the word "dynamics"
  dataByGrainType.forEach((value, key) => {
    if (key.includes("dynamics")) {
      dataByGrainType.delete(key);
    }
  });

  console.log("👉 dataByGrainType", dataByGrainType.keys())

  // figure out the active grain type index from the name (grainType)
  const activeGrainTypeIndex = Array.from(dataByGrainType.keys()).indexOf(grainType);
  console.log(grainType, '---->', activeGrainTypeIndex)
  
  // Set the active grain type to the first grain type
  const activeGrainType = Array.from(dataByGrainType.keys())[activeGrainTypeIndex];
  // use useActiveGrainType composable instead
  // const { activeGrainType } = useActiveGrainType();

  return forecastedData.get(activeGrainType)
    // .sort((a, b) => b[sortKey] - a[sortKey]);
}
