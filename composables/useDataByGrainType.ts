import { group } from 'd3'

export function useDataByGrainType() {
  const grainData = useGrainData();
  const groupedData = group(grainData, (d) => d.fileName);
  // remove groupings where the key includes the word "dynamics"
  groupedData.forEach((value, key) => {
    if (key.includes("dynamics")) {
      groupedData.delete(key);
    }
  });
  return groupedData;
}