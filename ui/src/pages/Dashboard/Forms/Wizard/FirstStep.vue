<template>
  <ValidationObserver ref="form">
    <form @submit.prevent="validate">
      <h5 class="text-center">
        Please tell us more about yourself.
      </h5>
      <div class="row">
        <div class="col-md-6">
          <ValidationProvider
            v-slot="{ passed, failed }"
            name="firstName"
            rules="required"
          >
            <fg-input
              v-model="firstName"
              name="firstName"
              :error="failed ? 'The First Name field is required': null"
              :has-success="passed"
              placeholder="First Name (required)"
              addon-left-icon="nc-icon nc-single-02"
            />
          </ValidationProvider>
        </div>
        <div class="col-md-6">
          <ValidationProvider
            v-slot="{ passed, failed }"
            name="lastName"
            rules="required"
          >
            <fg-input
              v-model="lastName"
              name="lastName"
              :error="failed ? 'The Last Name field is required': null"
              :has-success="passed"
              placeholder="Last Name (required)"
              addon-left-icon="nc-icon nc-circle-10"
            />
          </ValidationProvider>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <ValidationProvider
            v-slot="{ passed, failed }"
            name="email"
            rules="required|email"
          >
            <fg-input
              v-model="email"
              name="email"
              :error="failed ? 'The Email field is required': null"
              :has-success="passed"
              placeholder="Email (required)"
            />
          </ValidationProvider>
        </div>
      </div>
    </form>
  </ValidationObserver>
</template>
<script>
import { extend } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';

extend('required', required);
extend('email', email);

export default {
  data() {
    return {
      image: '',
      firstName: '',
      lastName: '',
      email: '',
    };
  },
  methods: {
    validate() {
      return this.$refs.form.validate().then((res) => {
        this.$emit('on-validated', res);
        return res;
      });
    },
  },
};
</script>
<style>
</style>
