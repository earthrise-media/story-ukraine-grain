const sortKey = ref("oblastNameNormalized")

function computeTotal(columnKey, activeData) {
  if (!activeData) return 0;
  return activeData.reduce(
    (acc, { [columnKey]: value }) => acc + +value,
    0
  )
}

// Takes a ukranian oblast and scales it by the value provided
function formatAndScaleValue(value, oblastKey, oblastScales) {

  // Get the proper scale for this oblast name
  const scale = oblastScales ? oblastScales[oblastKey] : 1;

  // If the scale is undefined, set it to 1
  const sliderScale = (scale >= 0 ? scale : 1);

  // Return the value scaled by the sliderScale
  return formatValue(value * sliderScale);
}

// Takes a number and rounds it so it's not long
function formatValue(value) {
  return (+value).toFixed(1);
}

// takes an oblast, adds scaled values, then formats all the values
// you gotta give it scales to scale it
const scaleOblast = (oblast, oblastScales) => {
  const harvestedAreaOriginal = formatValue(oblast.harvestedArea);
  const grainYieldOriginal = formatValue(oblast.grainYield);
  const volumeOriginal = formatValue(oblast.volume);
  // const formatAndScaleForOblast = (value) => formatAndScaleValue(value, oblast.oblastNameEnglish, oblastScales)
  const harvestedArea = formatAndScaleValue(
    oblast.harvestedArea,
    oblast.oblastNameEnglish,
    oblastScales,
  );
  const grainYield = formatAndScaleValue(
    oblast.grainYield,
    oblast.oblastNameEnglish,
    oblastScales
  );
  const volume = formatAndScaleValue(
    oblast.volume,
    oblast.oblastNameEnglish,
    oblastScales
  );
  return {
    ...oblast,
    harvestedAreaOriginal,
    grainYieldOriginal,
    volumeOriginal,
    harvestedArea,
    grainYield,
    volume,
  };
};

export function useActiveData() {
  // takes the activeGrainType and the scaled grain data grouped by fileName and
  const dataByGrainType = useDataByGrainType();
  const { activeGrainType } = useActiveGrainType();
  const { scenario } = useCurrentScenario();

  return computed(() => {
    console.log('🤪 this computed is being run')
    // gets a list of oblasts for the active grain type
    if (!dataByGrainType) return;
    if (!activeGrainType.value) return;
    if (!dataByGrainType.get(activeGrainType.value)) {
      console.error('No data for active grain type')
      return new Map()
    }
    const oblastsForActive = dataByGrainType.get(activeGrainType.value);

    if(!oblastsForActive) {
      console.error('No oblasts for active grain type')
      return new Map()
    }

    // we wanna see oblastsForActive
    console.log('🤪 oblastsForActive', oblastsForActive)

    // sort by the current sortKey
    const sortedActiveData = oblastsForActive
      .map((oblast) => scaleOblast(oblast, scenario.value.oblastScales))
      .sort((a, b) => b[sortKey.value] - a[sortKey.value]);

    console.log('\n\n\n---> 🤪 sortedActiveData', sortedActiveData)

    // converts this list into a map by oblast
    const activeDataByOblast = sortedActiveData.reduce((acc, oblast) => {
      acc[oblast.oblastNameNormalized] = oblast;
      return acc
    }, {})

    // console log everything
    console.log('\n\n\n\n----> 🤪 activeDataByOblast', activeDataByOblast)

    // compute totals and return object with activeData
    const active = {
      activeData: sortedActiveData,
      activeDataByOblast,
      totalHarvestedArea: computeTotal("harvestedArea", sortedActiveData),
      totalYield: computeTotal("grainYield", sortedActiveData),
      totalVolume: computeTotal("volume", sortedActiveData),
    }
    // console.log('========> ACTIVE', active.activeData)
    return active
  })
}
