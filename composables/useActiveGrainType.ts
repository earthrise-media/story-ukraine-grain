// const globalState = reactive({
//   someString: "Initial value",
//   someBoolean: false
// });

// export const useStatefulComposable = () => {
//   const localState = reactive({
//     someString: "Initial value",
//     someBoolean: false
//   });

//   const updateValues = (sValue: string, bValue: boolean) => {
//     // Set the global state values
//     globalState.someString = sValue;
//     globalState.someBoolean = bValue;

//     // Set the local state values
//     localState.someString = sValue;
//     localState.someBoolean = bValue;
//   };

//   return {
//     globalState,
//     localState,
//     updateValues
//   };
// };

/*
// set active grain type from the activeGrainIndex
const activeGrainType = Array.from(dataByGrainType.keys())[activeGrainIndex];
*/

const activeGrainTypeState = reactive({
  activeGrainType: "",
  activeGrainIndex: 0
});

const dataByGrainType = await useDataByGrainType();

// make a stateful composable to hold the activeGrainType
export const useActiveGrainType = () => {

  // set active grain type from the activeGrainIndex
  const setActiveGrainType = (activeGrainTypeIndex) => {    
    activeGrainTypeState.activeGrainType = Array.from(dataByGrainType.keys())[activeGrainTypeIndex];
    activeGrainTypeState.activeGrainIndex = activeGrainIndex;
  };

  // set active grain type from the activeGrainIndex
  const activeGrainType = computed(() => {
    return activeGrainTypeState.activeGrainType;
  });

  const activeGrainIndex = computed(() => {
    return activeGrainTypeState.activeGrainIndex;
  });

  return {
    activeGrainType,
    activeGrainIndex,
    setActiveGrainType
  };
}