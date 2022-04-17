<template>
  <div class="extended-forms">
    <card>
      <div class="col-12">
        <div class="row">
          <div class="col-lg-4">
            <h4 class="title">
              Datetime Picker
            </h4>
            <fg-input>
              <el-date-picker
                v-model="dateTimePicker"
                type="datetimerange"
                placeholder="Datetime picker here"
                :picker-options="pickerOptions1"
              />
            </fg-input>
          </div>
          <div class="col-lg-4">
            <h4 class="title">
              Date Picker
            </h4>
            <fg-input>
              <el-date-picker
                v-model="datePicker"
                type="date"
                placeholder="Date picker here"
                :picker-options="pickerOptions1"
              />
            </fg-input>
          </div>
          <div class="col-lg-4">
            <h4 class="title">
              Time Picker
            </h4>
            <fg-input>
              <el-time-select
                v-model="timePicker"
                :picker-options="{
                  start: '00:00',
                  step: '00:15',
                  end: '23:59'
                }"
                placeholder="Time picker here"
              />
            </fg-input>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <h4 class="title">
              Switches
            </h4>
            <div class="row">
              <div class="col-md-4">
                <p class="category">
                  Default
                </p>
                <l-switch
                  v-model="switches.defaultOn"
                  type="primary"
                  on-text="ON"
                  off-text="OFF"
                />
                <l-switch
                  v-model="switches.defaultOff"
                  type="primary"
                  on-text="ON"
                  off-text="OFF"
                />
              </div>
              <div class="col-md-4">
                <p class="category">
                  Plain
                </p>
                <l-switch v-model="switches.plainOn" />
                <l-switch v-model="switches.plainOff" />
              </div>
              <div class="col-md-4">
                <p class="category">
                  With Icons
                </p>
                <l-switch v-model="switches.withIconsOn">
                  <i
                    slot="on"
                    class="fa fa-check"
                  />
                  <i
                    slot="off"
                    class="fa fa-times"
                  />
                </l-switch>
                <l-switch v-model="switches.withIconsOff">
                  <i
                    slot="on"
                    class="fa fa-check"
                  />
                  <i
                    slot="off"
                    class="fa fa-times"
                  />
                </l-switch>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <h4 class="title">
              Tags
            </h4>

            <el-tag
              v-for="tag in tags.dynamicTags"
              :key="tag"
              size="small"
              type="warning"
              :closable="true"
              :close-transition="false"
              @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>

            <input
              ref="saveTagInput"
              v-model="tags.inputValue"
              type="text"
              placeholder="New Tag"
              class="form-control input-new-tag"
              size="mini"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
            >
          </div>
          <div class="col-md-6">
            <h4 class="title">
              Customisable Select
            </h4>
            <div class="row">
              <div class="col-md-6">
                <el-select
                  v-model="selects.simple"
                  class="select-danger"
                  size="large"
                  placeholder="Single Select"
                >
                  <el-option
                    v-for="option in selects.countries"
                    :key="option.label"
                    class="select-danger"
                    :value="option.value"
                    :label="option.label"
                  />
                </el-select>
              </div>
              <div class="col-md-6">
                <el-select
                  v-model="selects.multiple"
                  multiple
                  class="select-primary"
                  size="large"
                  placeholder="Multiple Select"
                >
                  <el-option
                    v-for="option in selects.countries"
                    :key="option.label"
                    class="select-primary"
                    :value="option.value"
                    :label="option.label"
                  />
                </el-select>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <h4 class="title">
              Progress Bars
            </h4>
            <l-progress :value="30" />
            <l-progress
              :value="60"
              type="info"
            />
            <l-progress :values="[{type:'success', value:35},{type:'warning', value:20}, {type:'danger', value: 10}]" />
          </div>
          <div class="col-md-6">
            <h4 class="title">
              Sliders
            </h4>
            <el-slider
              v-model="sliders.simple"
              class="slider-success"
            />
            <br>
            <el-slider
              v-model="sliders.rangeSlider"
              class="slider-info"
              :max="100"
              range
            />
          </div>
        </div>
      </div>
    </card> <!-- end card -->
  </div>
</template>
<script>
import {
  DatePicker, TimeSelect, Slider, Tag, Input, Button, Select, Option,
} from 'element-ui';
import {
  Progress as LProgress,
  Switch as LSwitch,
  FormGroupInput as FgInput,
} from 'src/components/index';

export default {
  components: {
    FgInput,
    [DatePicker.name]: DatePicker,
    [TimeSelect.name]: TimeSelect,
    [Slider.name]: Slider,
    [Tag.name]: Tag,
    [Input.name]: Input,
    [Button.name]: Button,
    [Option.name]: Option,
    [Select.name]: Select,
    LSwitch,
    LProgress,
  },
  data() {
    return {
      enabledRadio: '2',
      disabledRadio: '2',
      switches: {
        defaultOn: true,
        defaultOff: false,
        plainOn: true,
        plainOff: false,
        withIconsOn: true,
        withIconsOff: false,
      },
      sliders: {
        simple: 30,
        rangeSlider: [20, 50],
      },
      selects: {
        simple: '',
        countries: [{ value: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
          { value: 'Bahasa Melayu', label: 'Bahasa Melayu' },
          { value: 'Català', label: 'Català' },
          { value: 'Dansk', label: 'Dansk' },
          { value: 'Deutsch', label: 'Deutsch' },
          { value: 'English', label: 'English' },
          { value: 'Español', label: 'Español' },
          { value: 'Eλληνικά', label: 'Eλληνικά' },
          { value: 'Français', label: 'Français' },
          { value: 'Italiano', label: 'Italiano' },
          { value: 'Magyar', label: 'Magyar' },
          { value: 'Nederlands', label: 'Nederlands' },
          { value: 'Norsk', label: 'Norsk' },
          { value: 'Polski', label: 'Polski' },
          { value: 'Português', label: 'Português' },
          { value: 'Suomi', label: 'Suomi' },
          { value: 'Svenska', label: 'Svenska' },
          { value: 'Türkçe', label: 'Türkçe' },
          { value: 'Íslenska', label: 'Íslenska' },
          { value: 'Čeština', label: 'Čeština' },
          { value: 'Русский', label: 'Русский' },
          { value: 'ภาษาไทย', label: 'ภาษาไทย' },
          { value: '中文 (简体)', label: '中文 (简体)' },
          { value: 'W">中文 (繁體)', label: 'W">中文 (繁體)' },
          { value: '日本語', label: '日本語' },
          { value: '한국어', label: '한국어' }],
        multiple: 'ARS',
      },
      tags: {
        dynamicTags: ['Tag 1', 'Tag 2', 'Tag 3'],
        inputVisible: false,
        inputValue: '',
      },
      pickerOptions1: {
        shortcuts: [{
          text: 'Today',
          onClick(picker) {
            picker.$emit('pick', new Date());
          },
        },
        {
          text: 'Yesterday',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          },
        },
        {
          text: 'A week ago',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          },
        }],
      },
      datePicker: '',
      dateTimePicker: '',
      timePicker: '',
    };
  },
  methods: {
    handleClose(tag) {
      this.tags.dynamicTags.splice(this.tags.dynamicTags.indexOf(tag), 1);
    },

    showInput() {
      this.tags.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      const { inputValue } = this.tags;
      if (inputValue) {
        this.tags.dynamicTags.push(inputValue);
      }
      this.tags.inputVisible = false;
      this.tags.inputValue = '';
    },
  },
};
</script>
<style>
.extended-forms .el-select {
  width: 100%;
  margin-bottom: 30px;
}

.extended-forms .progress {
  margin-bottom: 30px;
}
</style>
