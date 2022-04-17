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
            v-slot="{ passed, failed }"
            name="email"
            rules="required|email"
          >
            <fg-input
              v-model="email"
              type="email"
              :error="failed ? 'The Email field is required': null"
              :has-success="passed"
              label="Email address"
              name="email"
            />
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ passed, failed }"
            name="password"
            rules="required|min:5"
          >
            <fg-input
              v-model="password"
              type="password"
              :error="failed ? 'The Password field is required': null"
              :has-success="passed"
              name="password"
              label="Password"
            />
          </ValidationProvider>
        </div>
        <div class="d-flex justify-content-center">
          <button
            type="submit"
            class="btn btn-fill btn-info btn-wd"
          >
            Login
          </button>
        </div>
      </card>
    </form>
  </ValidationObserver>
</template>
<script>
import { extend } from 'vee-validate';
import { required, email, min } from 'vee-validate/dist/rules';

extend('email', email);
extend('required', required);
extend('min', min);

export default {
  data() {
    return {
      email: '',
      password: '',
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
