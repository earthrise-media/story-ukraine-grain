<template>
  <div class="scrollytelling-container">
    <div class="text-container w-50">
      <p>Where is ukranian grain grown?</p>
      <p>Where is ukranian grain grown?</p>
      <p>Where is ukranian grain grown?</p>
      <p>Where is ukranian grain grown?</p>
      <p>Where is ukranian grain grown?</p>
      <p>Where is ukranian grain grown?</p>
    <p>Where is ukranian grain grown?</p>
    <p>Where is ukranian grain grown?</p>
    </div>

    <div class="step-container w-50 fixed top-0 right-0">
        <svg>
          <!-- a rect we will change color of as we scroll through steps -->
          <rect
            id="debug-scroll-test-rect"
            x="0"
            y="0"
            width="100"
            height="100"
            :fill="rectFill"
            :stepIndex="stepIndex"
          />
        </svg>
    </div>
  </div>
</template>
<script setup>
import scrollama from "scrollama";

const stepIndex = ref(0); // keep track of the index
const rectFill = ref("white");


// watch for changes to stepIndex when a user scrolls
watch(stepIndex, (newIndex) => {
  if (newIndex === 1) {
    // show the icicle map of UKR exports
    rectFill.value = "yellow";
  } else if (newIndex === 2) {
    // show the icicle map of UKR and RUS exports
    rectFill.value = "red";
  } else if (newIndex === 3) {
    // show the icicle map of UKR and RUS exports
    rectFill.value = "blue";
  } else if (newIndex === 4) {
    // show the icicle map of UKR and RUS exports
    rectFill.value = "green";
  } else if (newIndex === 5) {
    // show the icicle map of UKR and RUS exports
    rectFill.value = "purple";
  } else if (newIndex === 6) {
    // show the icicle map of UKR and RUS exports
    rectFill.value = "orange";
  } else if (newIndex === 7) {
    // show the icicle map of UKR and RUS exports
    rectFill.value = "pink";
  } else {
    // show the icicle map of UKR and RUS exports
    rectFill.value = "white";
  }
});

onMounted(() => {
  // set up scrollama
  const scroller = scrollama();

  // setup the instance, pass callback functions
  scroller
    .setup({
      step: ".text-container p",
      offset: 0.5,
      // debug: true,
    })
    .onStepEnter((response) => {
      // response = { element, direction, index }
      console.log(response);
      stepIndex.value = response.index;
    })
    .onStepExit((response) => {
      // response = { element, direction, index }
      // console.log(response);
    });
});
</script>
<style>
.text-container p {
  margin-top: 33vh;
  margin-bottom: 33vh;
  height: 33vh;
  width: 100%;
  background-color: #CCC;
}

.step-container {

}

.text-container {

}
</style>
