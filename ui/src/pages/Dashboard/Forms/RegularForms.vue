<template>
  <div class="row">
    <div class="col-md-6">
      <card class="stacked-form" title="Stacked Form">
        <form method="#" action="#" @submit.prevent>
          <template slot="header">
            <h4 class="card-title">
              Stacked Form
            </h4>
          </template>
          <div>
            <fg-input label="Email address"
                      type="email"
                      placeholder="Enter email">
            </fg-input>
            <fg-input label="Password"
                      type="password"
                      placeholder="Password">
            </fg-input>
            <div class="form-group">
              <checkbox>Subscribe to newsletter</checkbox>
            </div>
            <button type="submit" class="btn btn-fill btn-info">Submit</button>
          </div>
        </form>
      </card>
    </div>
    <div class="col-md-6">
        <card class="horizontal-form" title="Horizontal Form">
          <template slot="header">
            <h4 class="card-title">
              Horizontal Form
            </h4>
          </template>
          <form action="#" method="#" @submit.prevent>
            <div class="col-12">
              <fg-input label="email"
                        type="email"
                        class="row"
                        labelClasses="col-md-3 col-12"
                        inputClasses="col-md-9 col-12"
                        placeholder="Email">
              </fg-input>
              <fg-input label="password"
                        type="password"
                        class="row"
                        labelClasses="col-md-3 col-12"
                        inputClasses="col-md-9 col-12"
                        placeholder="Password">
              </fg-input>
              <fg-input class="row"
                        label=" "
                        labelClasses="col-md-3 col-12"
                        inputClasses="col-md-9 col-12">
                <checkbox>Remember me</checkbox>
              </fg-input>
            </div>
          </form>
          <div class="row">
            <div class="col-md-9 offset-md-3 col-12">
              <button type="submit" class="btn btn-fill btn-info">
                Sign in
              </button>
            </div>
          </div>
        </card>
    </div> <!-- end card -->
    <div class="col-md-12">
      <card>
        <template slot="header">
          <h4 class="card-title">Form Elements</h4>
        </template>
        <div>
          <form method="get" action="/" class="form-horizontal">
            <fg-input label="With help"
                      type="text"
                      placeholder="Enter email">
              <small class="form-text text-muted" slot="helpBlock">A block of help text that breaks onto a new line.</small>
            </fg-input>

            <fg-input label="Password"
                      type="password">
            </fg-input>

            <fg-input label="Placeholder"
                      placeholder="Placeholder"
                      type="text">
            </fg-input>

            <fg-input label="Disabled"
                      placeholder="Disabled input here"
                      disabled
                      type="text">
            </fg-input>

            <fg-input label="Static control">
              <p class="form-control-static">hello@creative-tim.com</p>
            </fg-input>

            <fg-input label="Checkboxes and radios">
              <checkbox v-model="checkboxes.first">First checkbox</checkbox>
              <checkbox v-model="checkboxes.second">Second checkbox</checkbox>

              <radio label="1" v-model="radios.radio1">First Radio</radio>
              <radio label="2" v-model="radios.radio1">Second Radio</radio>
            </fg-input>

            <fg-input label="Inline checkboxes">
              <div>
                <checkbox v-model="checkboxes.a" :inline="true">a</checkbox>
                <checkbox v-model="checkboxes.b" :inline="true">b</checkbox>
                <checkbox v-model="checkboxes.c" :inline="true">c</checkbox>
              </div>

            </fg-input>

            <fg-input label="Input with success"
                      type="text"
                      value="Success"
                      class="has-success">
            </fg-input>

            <fg-input label="Input with error"
                      type="text"
                      value="Error"
                      class="has-error">
            </fg-input>

            <fg-input label="Column sizing"
                      class="column-sizing">
              <div class="row">
                <div class="col-md-3">
                  <fg-input placeholder=".col-md-3"/>
                </div>
                <div class="col-md-4">
                  <fg-input placeholder=".col-md-4"/>
                </div>
                <div class="col-md-5">
                  <fg-input placeholder=".col-md-5"/>
                </div>
              </div>
            </fg-input>

            <fg-input label="Input groups">
              <div class="row">
                <fg-input class="col-sm-3"
                          placeholder="Username"
                          type="text">
                  <span slot="addonRight"></span>
                </fg-input>
                <fg-input class="col-sm-3"
                          type="text">
                  <span slot="addonLeft">.00</span>
                </fg-input>
                <fg-input class="col-sm-6"
                          type="text">
                  <span slot="addonLeft">$</span>
                  <span slot="addonRight">.00</span>
                </fg-input>
              </div>
            </fg-input>

            <fg-input label="Textarea">
              <textarea class="form-control" placeholder="Here can be your nice text" rows="3"></textarea>
            </fg-input>
          </form>
        </div>
      </card>  <!-- end card -->
    </div>
  </div>
</template>
<script>
  import { Checkbox, Radio } from 'src/components/index'

  export default {
    components: {
      Checkbox,
      Radio
    },
    data () {
      return {
        radios: {
          radio1: '1',
          radio2: '2',
          radio3: '2'
        },
        checkboxes: {
          first: false,
          second: false,
          a: false,
          b: false,
          c: false,
          unchecked: false,
          checked: true,
          disabledUnchecked: false,
          disabledChecked: true
        }
      }
    }
  }
</script>
<style>
</style>
