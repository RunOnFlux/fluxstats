<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(submit)">
      <card>
        <div slot="header">
          <h4 class="card-title">
            Login Form
          </h4>
        </div>
        <div>
          <ValidationProvider
            name="email"
            rules="required|email"
            v-slot="{ passed, failed }"
          >
            <fg-input  type="email"
                       :error="failed ? 'The Email field is required': null"
                       :hasSuccess="passed"
                       label="Email address"
                       name="email"
                       v-model="email">
            </fg-input>
          </ValidationProvider>

          <ValidationProvider
            name="password"
            rules="required|min:5"
            v-slot="{ passed, failed }"
          >
            <fg-input  type="password"
                       :error="failed ? 'The Password field is required': null"
                       :hasSuccess="passed"
                       name="password"
                       label="Password"
                       v-model="password">
            </fg-input>
          </ValidationProvider>
        </div>
        <div class="d-flex justify-content-center">
          <button type="submit" class="btn btn-fill btn-info btn-wd">Login</button>
        </div>
      </card>
    </form>
  </ValidationObserver>
</template>
<script>
import { extend } from "vee-validate";
import { required, email, min } from "vee-validate/dist/rules";

extend("email", email);
extend("required", required);
extend("min", min);

  export default {
    data() {
      return {
        email: "",
        password: ""
      };
    },
    methods: {
      submit() {
        alert("Form has been submitted!");
      }
    }
  }
</script>
<style>
</style>
