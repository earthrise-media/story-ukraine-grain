// can also use: "12 кукур-Table 1"
const DEFAULT_GRAIN_TYPE = "10 пшенЯР-Table 1";

const activeGrainTypeState = ref(DEFAULT_GRAIN_TYPE);

// make a stateful composable to hold the activeGrainType
export const useActiveGrainType = () => {
  // set active grain type
  const setActiveGrainType = (activeGrainType) => {
    activeGrainTypeState.value = activeGrainType;
  };

  return {
    activeGrainType: activeGrainTypeState,
    setActiveGrainType
  };
}