const DEFAULT_SCENARIO = {
  name: "User-defined",
  scale: 1,
  oblastScales: {},
}

// oblastScales contains all of the scalars for each oblast
// this composable stores and returns the current scenario
// it also applies the oblast scales to the data?
// TODO: apply global scalar?

const scenarioState = ref(DEFAULT_SCENARIO);

// make a stateful composable to hold the activeGrainType
export const useCurrentScenario = () => {

  // set scalar for a specific oblast in state
  const setOblastScale = ({ oblastName, scale }) => {
    // convert to a scalar before storing in the map of user-set values
    scenarioState.value.oblastScales[oblastName] = scale;
  }

  // set entire scenario (i.e. projection buttons)
  const setScenario = (scenario) => {
    scenarioState.value = scenario
  }

  // TODO setGlobalScale ??

  return {
    scenario: scenarioState,
    setOblastScale,
    setScenario,
  };
}
