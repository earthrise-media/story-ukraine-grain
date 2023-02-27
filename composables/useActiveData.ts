import { normalizeOblastName } from "~~/helpers";

// const sortKey = ref("oblastNameNormalized")
const sortKey = ref("harvestedArea")

function computeTotal(columnKey, activeData) {
  if (!activeData) return 0;
  return activeData.reduce(
    (acc, { [columnKey]: value }) => acc + +value,
    0
  )
}

// Takes a ukranian oblast and scales it by the value provided
function formatAndScaleValue(value, oblastKeyDenormalized, oblastScales) {
  const oblastKey = normalizeOblastName(oblastKeyDenormalized)

  // Get the proper scale for this oblast name
  const scale = oblastScales ? oblastScales[oblastKey] : 1;

  // If the scale is undefined, set it to 1
  const sliderScale = (scale >= 0 ? scale : 1);

  // Return the value scaled by the sliderScale
  return formatValue(value * sliderScale);
}

// Takes a number and rounds it so it's not long
function formatValue(value) {
  return +(+value).toFixed(1);
}

// takes an oblast, adds scaled values, then formats all the values
// you gotta give it scales to scale it
const scaleOblast = (oblast, oblastScales) => {
  const harvestedAreaOriginal = formatValue(oblast.harvestedArea);
  const grainYieldOriginal = formatValue(oblast.grainYield);
  const volumeOriginal = formatValue(oblast.volume);
  const formatAndScaleForOblast = (value) =>
    formatAndScaleValue(value, oblast.oblastNameNormalized, oblastScales)
  const harvestedArea = formatAndScaleForOblast(oblast.harvestedArea);
  const grainYield = formatAndScaleForOblast(oblast.grainYield);
  const volume = formatAndScaleForOblast(oblast.volume);
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

  return computed(() => {
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
    const { scenario } = useCurrentScenario();

    // sort by the current sortKey

    // unsorted, unscaled data
    const scaledSortedActiveData = oblastsForActive
      .map((oblast) => scaleOblast(oblast, scenario.value.oblastScales))
      .sort((a, b) => b[sortKey.value] - a[sortKey.value]);

    // converts this list into a map by oblast
    const activeDataByOblast = scaledSortedActiveData.reduce((acc, oblast) => {
      acc[oblast.oblastNameNormalized] = oblast;
      return acc
    }, {})

    // compute totals and return object with activeData
    return {
      activeData: scaledSortedActiveData,
      activeDataByOblast,
      totalHarvestedArea: computeTotal("harvestedArea", scaledSortedActiveData),
      totalYield: computeTotal("grainYield", scaledSortedActiveData),
      totalVolume: computeTotal("volume", scaledSortedActiveData),
      harvestedAreaOriginalTotal: computeTotal("harvestedArea", oblastsForActive),
      yieldOriginalTotal: computeTotal("grainYield", oblastsForActive),
      volumeOriginalTotal: computeTotal("volume", oblastsForActive),
    }
  })
}
