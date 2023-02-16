import { group } from 'd3'

export async function useDataByGrainType() {
  const grainData = await useGrainData();
  // const groupedData = group(grainData, (d) => d.metadata[0][0]);
  const groupedData = group(grainData, (d) => d.fileName);
  return groupedData
}