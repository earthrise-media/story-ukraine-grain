const DEFAULT_SCENARIO = {
  name: "User-defined",
  scale: 1,
  oblastScales: {},
}

const scenarioState = ref(DEFAULT_SCENARIO);

// make a stateful composable to hold the activeGrainType
export const useCurrentScenario = () => {

  // set scalar for a specific oblast in state
  const setOblastScale = ({ oblastName, percentage }) => {
    // convert to a scalar before storing in the map of user-set values
    scenarioState.value.oblastScales[oblastName] = +percentage / 100;
  }

  // set entire scenario (i.e. projection buttons)
  const setScenario = (scenario) => {
    scenarioState.value = scenario
  }

  return {
    scenario: scenarioState,
    setOblastScale,
    setScenario,
  };
}
