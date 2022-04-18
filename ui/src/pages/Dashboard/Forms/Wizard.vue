<template>
  <div>
    <div class="row d-flex justify-content-center">
      <div class="col-sm-8">
        <div
          id="wizardCard"
          class="card card-wizard"
        >
          <form-wizard
            shape="tab"
            error-color="#FB404B"
            color="#35495E"
            @on-complete="wizardComplete"
          >
            <tab-content
              title="Personal details"
              class="col-12"
              :before-change="() => validateStep('firstStep')"
              icon="nc-icon nc-badge"
            >
              <first-step
                ref="firstStep"
                @on-validated="onStepValidated"
              />
            </tab-content>

            <tab-content
              title="Additional Info"
              class="col-12"
              :before-change="() => validateStep('secondStep')"
              icon="nc-icon nc-notes"
            >
              <second-step
                ref="secondStep"
                @on-validated="onStepValidated"
              />
            </tab-content>

            <tab-content
              title="Last step"
              class="col-12"
              icon="nc-icon nc-check-2"
            >
              <div>
                <h2 class="text-center text-space">
                  Yuhuuu!
                  <br>
                  <small>Click on "<b>Finish</b>" to join our community</small>
                </h2>
              </div>
            </tab-content>

            <button
              slot="prev"
              class="btn btn-default btn-fill btn-wd btn-back"
            >
              Back
            </button>
            <button
              slot="next"
              class="btn btn-default btn-fill btn-wd btn-next"
            >
              Next
            </button>
            <button
              slot="finish"
              class="btn btn-success btn-fill btn-wd"
            >
              Finish
            </button>
          </form-wizard>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { FormWizard, TabContent } from 'vue-form-wizard';
import 'vue-form-wizard/dist/vue-form-wizard.min.css';
import Swal from 'sweetalert2';
import FirstStep from './Wizard/FirstStep.vue';
import SecondStep from './Wizard/SecondStep.vue';

export default {
  components: {
    FormWizard,
    TabContent,
    FirstStep,
    SecondStep,
  },
  data() {
    return {
      wizardModel: {},
    };
  },
  methods: {
    validateStep(ref) {
      return this.$refs[ref].validate();
    },
    onStepValidated(validated, model) {
      this.wizardModel = { ...this.wizardModel, ...model };
    },
    wizardComplete() {
      Swal.fire({
        title: 'Good job!',
        text: 'You clicked the finish button!',
        type: 'success',
        confirmButtonClass: 'btn btn-success',
        buttonsStyling: false,
      });
    },
  },
};
</script>
<style lang="scss">
.vue-form-wizard .wizard-icon-circle.tab_shape {
  background-color: #9a9a9a !important;
  color: white;
}
.vue-form-wizard .wizard-tab-content {
  display: flex; // to avoid horizontal scroll when animating
  .wizard-tab-container {
    display: block;
    animation: fadeIn 0.5s;
  }
}
</style>
