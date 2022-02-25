<template>
  <ValidationObserver ref="form">
    <form @submit.prevent="validate">
      <h5 class="text-center">Please tell us more about yourself.</h5>
      <div class="row">
        <div class="col-md-6">
          <ValidationProvider
            name="firstName"
            rules="required"
            v-slot="{ passed, failed }"
          >
            <fg-input name="firstName"
                      :error="failed ? 'The First Name field is required': null"
                      :hasSuccess="passed"
                      placeholder="First Name (required)"
                      v-model="firstName"
                      addon-left-icon="nc-icon nc-single-02">
            </fg-input>
          </ValidationProvider>
        </div>
        <div class="col-md-6">
          <ValidationProvider
            name="lastName"
            rules="required"
            v-slot="{ passed, failed }"
          >
            <fg-input name="lastName"
                      :error="failed ? 'The Last Name field is required': null"
                      :hasSuccess="passed"
                      placeholder="Last Name (required)"
                      v-model="lastName"
                      addon-left-icon="nc-icon nc-circle-10">
            </fg-input>
          </ValidationProvider>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <ValidationProvider
            name="email"
            rules="required|email"
            v-slot="{ passed, failed }"
          >
            <fg-input name="email"
                      :error="failed ? 'The Email field is required': null"
                      :hasSuccess="passed"
                      placeholder="Email (required)"
                      v-model="email">
            </fg-input>
          </ValidationProvider>
        </div>
      </div>
    </form>
  </ValidationObserver>
</template>
<script>
  import { extend } from "vee-validate";
  import { required, email } from "vee-validate/dist/rules";

  extend("required", required);
  extend("email", email);

  export default {
    data() {
      return {
        image: "",
        firstName: "",
        lastName: "",
        email: ""
      };
    },
    methods: {
      validate() {
        return this.$refs.form.validate().then(res => {
          this.$emit('on-validated', res)
          return res
        })
      }
    }
  }
</script>
<style>
</style>
