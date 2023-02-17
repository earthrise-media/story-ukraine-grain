const activeGrainTypeState = ref(null);

// stateful composable that holds the active fileName / grain type key that computes activeData from dataByGrainType
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