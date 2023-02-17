import { group } from 'd3'

// TODO: We are moving this over to useActiveData
// // Grouped the scaled data and returned it
// export function useScaledDataByGrainType() {
//   const scaledData = useScaledGrainData();

//   return computed(() => {
//     // remove groupings where the key includes the word "dynamics"
//     const groupedData = group(scaledData.value, (d) => d.fileName);
//     groupedData.forEach((value, key) => {
//       if (key.includes("dynamics")) {
//         groupedData.delete(key);
//       }
//     });
//     return groupedData;
//   });
// }