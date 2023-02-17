const sortKey = ref("oblastNameUkrainian")

function computeTotal(columnKey, activeData) {
  if(!activeData) return 0;
  return activeData.reduce(
    (acc, { [columnKey]: value }) => acc + +value,
    0
  )
}

export function useActiveData() {
  // fetch the forecast data from the json file
  const scaledDataByGrainType = useScaledDataByGrainType();
  const { activeGrainType } = useActiveGrainType();

  return computed(() => {
    const sortedActiveData = scaledDataByGrainType.value.get(activeGrainType.value)
      .sort((a, b) => b[sortKey.value] - a[sortKey.value]);

    const activeDataByOblast = sortedActiveData.reduce((acc, oblast) => {
      acc[oblast.oblastNameNormalized] = oblast;
      return acc
    }, {})

    return {
      activeData: sortedActiveData,
      activeDataByOblast,
      totalHarvestedArea: computeTotal("harvestedArea", sortedActiveData),
      totalYield: computeTotal("grainYield", sortedActiveData),
      totalVolume: computeTotal("volume", sortedActiveData),
    }
  })
}
