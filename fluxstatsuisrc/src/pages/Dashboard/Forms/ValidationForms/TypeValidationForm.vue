<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(submit)" class="form-horizontal">
      <card>
        <div slot="header">
          <h4 class="card-title">
            Register Form
          </h4>
        </div>
        <div>
          <ValidationProvider
            name="required"
            rules="required"
            v-slot="{ passed, failed }"
          >
            <fg-input type="text"
                      :error="failed ? 'The Text field is required': null"
                      :hasSuccess="passed"
                      name="requiredText"
                      v-model="required">
            </fg-input>
            <div slot="infoBlock">
              <code>required:true</code>
            </div>
          </ValidationProvider>

          <ValidationProvider
            name="email"
            rules="required|email"
            v-slot="{ passed, failed }"
          >
            <fg-input type="text"
                      :error="failed ? 'The Email field is required': null"
                      :hasSuccess="passed"
                      name="email"
                      v-model="email">
            </fg-input>
            <div slot="infoBlock">
              <code>email:true</code>
            </div>
          </ValidationProvider>

          <ValidationProvider
            name="number"
            rules="required|numeric"
            v-slot="{ passed, failed }"
          >
            <fg-input type="text"
                      :error="failed ? 'The Number field is required': null"
                      :hasSuccess="passed"
                      name="number"
                      v-model="number">
            </fg-input>
            <div slot="infoBlock">
              <code>number:true</code>
            </div>
          </ValidationProvider>

          <ValidationProvider
            name="url"
            :rules="{
              required: true,
              regex: /(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_\/0-9\-#.]*)\??([a-z_\/0-9\-#=&]*)/g
            }"
            v-slot="{ passed, failed }"
          >
            <fg-input type="text"
                      :error="failed ? 'The Url field is required': null"
                      :hasSuccess="passed"
                      name="url"
                      v-model="url">
            </fg-input>
            <div slot="infoBlock">
              <code>url:true</code>
            </div>
          </ValidationProvider>

          <ValidationProvider
            name="equal"
            rules="confirmed:confirmation"
            v-slot="{ passed, failed }"
          >
            <fg-input type="text"
                      :error="failed ? 'The idDestination confirmation does not match': null"
                      :hasSuccess="passed"
                      name="idSource"
                      placeholder="#idSource"
                      v-model="idSource">
            </fg-input>
          </ValidationProvider>

          <ValidationProvider
            name="equalTo"
            vid="confirmation"
          >
            <fg-input type="text"
                      name="idDestination"
                      placeholder="#idDestination"
                      v-model="idDestination">
            </fg-input>
            <div slot="infoBlock">
              <code>confirmed: 'idSource'</code>
            </div>
          </ValidationProvider>

        </div>
        <div class="text-center">
          <button type="submit" class="btn btn-fill btn-info btn-wd">Validate inputs</button>
        </div>
      </card>
    </form>
  </ValidationObserver>
</template>
<script>
  import { extend } from "vee-validate";
  import { required, numeric, regex, confirmed } from "vee-validate/dist/rules";

  extend("required", required);
  extend("numeric", numeric);
  extend("regex", regex);
  extend("confirmed", confirmed);

  export default {
    data() {
      return {
        required: "",
        email: "",
        number: "",
        url: "",
        idSource: "",
        idDestination: ""
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
