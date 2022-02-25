<template>
  <ValidationObserver ref="form">
    <form @submit.prevent="validate">
      <h5 class="text-center">Please give us more details about your platform.</h5>
      <div class="row">
        <div class="col-12">
          <ValidationProvider
            name="website"
            :rules="{
              required: true,
              regex: /(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_\/0-9\-#.]*)\??([a-z_\/0-9\-#=&]*)/g
            }"
            v-slot="{ passed, failed }"
          >
            <fg-input name="website"
                      type="text"
                      :error="failed ? 'The Website field is required & URL matching': null"
                      :hasSuccess="passed"
                      placeholder="ex: http://www.creative-tim.com"
                      label="Your website"
                      v-model="website">
            </fg-input>
          </ValidationProvider>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <ValidationProvider
            name="framework"
            rules="required"
            v-slot="{ passed, failed }"
          >
            <fg-input name="framework"
                      :error="failed ? 'The Framework field is required': null"
                      :hasSuccess="passed"
                      placeholder="ex: Vue.js"
                      label="Framework Type"
                      v-model="framework">
            </fg-input>
          </ValidationProvider>
        </div>
        <div class="col-md-6">
          <ValidationProvider
            name="language"
            rules="required"
            v-slot="{ failed }"
          >
          <fg-input label="Language"
                    :error="failed ? 'The Language field is required': null">
            <el-select name="language"
                       class="select-default"
                       v-model="language">
              <el-option v-for="lang in languageOptions"
                         :key="lang.value"
                         class="select-default"
                         :label="lang.label"
                         :value="lang.value">
              </el-option>
            </el-select>
          </fg-input>
          </ValidationProvider>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <ValidationProvider
            name="bootstrap version"
            rules="required"
            v-slot="{ failed }"
          >
            <fg-input
                      name="bootstrap version"
                      :error="failed ? 'The Bootstrap field is required': null"
                      label="Bootstrap version">
              <el-select class="select-default"
                         v-model="bootstrapVersion">
                <el-option class="select-default" value="1.1">Bootstrap 1.1</el-option>
                <el-option class="select-default" value="2.0">Bootstrap 2.0</el-option>
                <el-option class="select-default" value="3.0">Bootstrap 3.0</el-option>
                <el-option class="select-default" value="4.0">Bootstrap 4.0(alpha)</el-option>
              </el-select>
            </fg-input>
          </ValidationProvider>
        </div>
        <div class="col-md-6">
          <ValidationProvider
            name="price"
            rules="required"
            v-slot="{ failed }"
          >
            <fg-input name="price" label="Price" :error="failed ? 'The Bootstrap field is required': null">
              <el-input-number v-model="price"
                               placeholder="ex: 19.00"
                               name="price">
              </el-input-number>
            </fg-input>
          </ValidationProvider>
        </div>
      </div>
    </form>
  </ValidationObserver>
</template>
<script>
  import { Select, Option } from 'element-ui'
  import { extend } from "vee-validate";
  import { required, email, regex } from "vee-validate/dist/rules";

  extend("required", required);
  extend("email", email);
  extend("regex", regex);

  export default {
    components: {
      [Select.name]: Select,
      [Option.name]: Option
    },
    data () {
      return {
        languageOptions: [
          {value: '', label: '- language -'},
          {value: 'ms', label: 'Bahasa Melayu'},
          {value: 'ca', label: 'Català'},
          {value: 'da', label: 'Dansk'},
          {value: 'de', label: 'Deutsch'},
          {value: 'en', label: 'English'},
          {value: 'es', label: 'Español'},
          {value: 'el', label: 'Eλληνικά'},
          {value: 'fr', label: 'Français'},
          {value: 'it', label: 'Italiano'},
          {value: 'hu', label: 'Magyar'},
          {value: 'nl', label: 'Nederlands'},
          {value: 'no', label: 'Norsk'},
          {value: 'pl', label: 'Polski'},
          {value: 'pt', label: 'Português'},
          {value: 'fi', label: 'Suomi'},
          {value: 'sv', label: 'Svenska'},
          {value: 'tr', label: 'Türkçe'},
          {value: 'is', label: 'Íslenska'},
          {value: 'cs', label: 'Čeština'},
          {value: 'ru', label: 'Русский'},
          {value: 'th', label: 'ภาษาไทย'},
          {value: 'zh', label: '中文 (简体)'},
          {value: 'zh-TW', label: '中文 (繁體)'},
          {value: 'ja', label: '日本語'},
          {value: 'ko', label: '한국어'}],
          website: '',
          framework: '',
          language: '',
          bootstrapVersion: '',
          price: ''
      }
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
