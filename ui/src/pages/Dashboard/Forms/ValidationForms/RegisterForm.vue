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
            v-slot="{ passed, failed }"
            name="email"
            rules="required|email"
          >
            <fg-input
              v-model="email"
              type="email"
              :error="failed ? 'The Email field is required': null"
              :has-success="passed"
              name="email"
            />
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ passed, failed }"
            vid="confirmation"
            rules="required"
          >
            <fg-input
              v-model="password"
              type="password"
              :error="failed ? 'The Password field is required': null"
              :has-success="passed"
              name="password"
            />
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ passed, failed }"
            rules="required|confirmed:confirmation"
          >
            <fg-input
              v-model="confirmPassword"
              type="password"
              :error="failed ? 'The Confirm field is required': null"
              :has-success="passed"
              name="confirm"
            />
          </ValidationProvider>

          <fg-input>
            <checkbox
              v-model="subscribe"
              name="subscribe"
            >
              Subscribe to newsletter
            </checkbox>
          </fg-input>
        </div>
        <div class="card-footer text-right">
          <button
            type="submit"
            class="btn btn-fill btn-info btn-wd"
          >
            Register
          </button>
        </div>
      </card>
    </form>
  </ValidationObserver>
</template>
<script>
import { extend } from 'vee-validate';
import { required, email, confirmed } from 'vee-validate/dist/rules';
import { Checkbox } from 'src/components/index';

extend('email', email);
extend('required', required);
extend('confirmed', confirmed);

export default {
  components: {
    Checkbox,
  },
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      subscribe: false,
    };
  },
  methods: {
    submit() {
      alert('Form has been submitted!');
    },
  },
};
</script>
<style>
</style>
