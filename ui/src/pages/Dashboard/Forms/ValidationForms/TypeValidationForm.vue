<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form
      class="form-horizontal"
      @submit.prevent="handleSubmit(submit)"
    >
      <card>
        <div slot="header">
          <h4 class="card-title">
            Register Form
          </h4>
        </div>
        <div>
          <ValidationProvider
            v-slot="{ passed, failed }"
            name="required"
            rules="required"
          >
            <fg-input
              v-model="required"
              type="text"
              :error="failed ? 'The Text field is required': null"
              :has-success="passed"
              name="requiredText"
            />
            <div slot="infoBlock">
              <code>required:true</code>
            </div>
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ passed, failed }"
            name="email"
            rules="required|email"
          >
            <fg-input
              v-model="email"
              type="text"
              :error="failed ? 'The Email field is required': null"
              :has-success="passed"
              name="email"
            />
            <div slot="infoBlock">
              <code>email:true</code>
            </div>
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ passed, failed }"
            name="number"
            rules="required|numeric"
          >
            <fg-input
              v-model="number"
              type="text"
              :error="failed ? 'The Number field is required': null"
              :has-success="passed"
              name="number"
            />
            <div slot="infoBlock">
              <code>number:true</code>
            </div>
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ passed, failed }"
            name="url"
            :rules="{
              required: true,
              regex: /(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_\/0-9\-#.]*)\??([a-z_\/0-9\-#=&]*)/g
            }"
          >
            <fg-input
              v-model="url"
              type="text"
              :error="failed ? 'The Url field is required': null"
              :has-success="passed"
              name="url"
            />
            <div slot="infoBlock">
              <code>url:true</code>
            </div>
          </ValidationProvider>

          <ValidationProvider
            v-slot="{ passed, failed }"
            name="equal"
            rules="confirmed:confirmation"
          >
            <fg-input
              v-model="idSource"
              type="text"
              :error="failed ? 'The idDestination confirmation does not match': null"
              :has-success="passed"
              name="idSource"
              placeholder="#idSource"
            />
          </ValidationProvider>

          <ValidationProvider
            name="equalTo"
            vid="confirmation"
          >
            <fg-input
              v-model="idDestination"
              type="text"
              name="idDestination"
              placeholder="#idDestination"
            />
            <div slot="infoBlock">
              <code>confirmed: 'idSource'</code>
            </div>
          </ValidationProvider>
        </div>
        <div class="text-center">
          <button
            type="submit"
            class="btn btn-fill btn-info btn-wd"
          >
            Validate inputs
          </button>
        </div>
      </card>
    </form>
  </ValidationObserver>
</template>
<script>
import { extend } from 'vee-validate';
import {
  required, numeric, regex, confirmed,
} from 'vee-validate/dist/rules';

extend('required', required);
extend('numeric', numeric);
extend('regex', regex);
extend('confirmed', confirmed);

export default {
  data() {
    return {
      required: '',
      email: '',
      number: '',
      url: '',
      idSource: '',
      idDestination: '',
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
