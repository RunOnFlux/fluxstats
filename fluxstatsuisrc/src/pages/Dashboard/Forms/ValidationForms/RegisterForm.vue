<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(submit)">
      <card>
        <div slot="header">
          <h4 class="card-title">
            Register Form
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
                       name="email"
                       v-model="email">
            </fg-input>
          </ValidationProvider>

          <ValidationProvider
            vid="confirmation"
            rules="required"
            v-slot="{ passed, failed }"
          >
            <fg-input  type="password"
                       :error="failed ? 'The Password field is required': null"
                       :hasSuccess="passed"
                       name="password"
                       v-model="password">
            </fg-input>
          </ValidationProvider>

          <ValidationProvider
            rules="required|confirmed:confirmation"
            v-slot="{ passed, failed }"
          >
            <fg-input  type="password"
                       :error="failed ? 'The Confirm field is required': null"
                       :hasSuccess="passed"
                       name="confirm"
                       v-model="confirmPassword">
            </fg-input>
          </ValidationProvider>

          <fg-input>
            <checkbox v-model="subscribe"
                      name="subscribe">Subscribe to newsletter
            </checkbox>
          </fg-input>
        </div>
        <div class="card-footer text-right">
          <button type="submit" class="btn btn-fill btn-info btn-wd">Register</button>
        </div>

      </card>
    </form>
  </ValidationObserver>
</template>
<script>
import { extend } from "vee-validate";
import { required, email, confirmed } from "vee-validate/dist/rules";
  import {Checkbox} from 'src/components/index'

extend("email", email);
extend("required", required);
extend("confirmed", confirmed);

export default {
  components: {
    Checkbox
  },
  data() {
    return {
      email: "",
      password: "",
      confirmPassword: "",
      subscribe: false
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
