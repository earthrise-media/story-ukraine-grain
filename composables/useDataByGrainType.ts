// groups grainData into a Map from fileName aka grain type to a list of the oblast entries for that grain/file
import { group } from 'd3'

export function useDataByGrainType() {
  const grainData = useGrainData();
  const groupedData = group(grainData, (d) => d.fileName);
  return groupedData;
}