<template>
  <component class="dropdown nav-item"
             :is="tag"
             :class="[{show: isOpen}]"
             aria-haspopup="true"
             :aria-expanded="isOpen"
             @click="toggleDropDown"
             v-click-outside="closeDropDown">

    <a class="dropdown-toggle nav-link"
       :class="{'hide-arrow': hideArrow}"
       data-toggle="dropdown">
      <slot name="title">
        <i :class="icon"></i>
        <span class="no-icon">{{title}}</span>
        <b class="caret"></b>
      </slot>
    </a>
    <ul class="dropdown-menu"
        :class="[{'dropdown-menu-right': position === 'right'}, {show: isOpen}]">
      <slot></slot>
    </ul>
  </component>
</template>
<script>
  export default {
    name: 'drop-down',
    props: {
      title: String,
      icon: String,
      position: String,
      hideArrow: Boolean,
      tag: {
        type: String,
        default: 'li'
      }
    },
    data () {
      return {
        isOpen: false
      }
    },
    methods: {
      toggleDropDown () {
        this.isOpen = !this.isOpen
        this.$emit('change', this.isOpen)
      },
      closeDropDown () {
        this.isOpen = false
        this.$emit('change', this.isOpen)
      }
    }
  }
</script>
<style scoped lang="scss">
  @import "~assets/sass/lbd/variables";
  @import "~assets/sass/lbd/mixins";
  li.dropdown {
    list-style-type: none;
  }

  .dropdown .dropdown-toggle {
    cursor: pointer;
  }
  .dropdown-menu{
    visibility: hidden;
    margin: 0;
    padding: 0;
    border-radius: $border-radius-extreme;
    display: block;
    z-index: 9000;
    position: absolute;

  @include opacity(0);
  @include box-shadow($dropdown-shadow);

  .show &{
  @include opacity(1);
    visibility: visible;
  }
  .select &{
    border-radius: $border-radius-bottom;
  @include box-shadow(none);
  @include transform-origin($select-coordinates);
  @include transform-scale(1);
  @include transition($fast-transition-time, $transition-linear);
    margin-top: -20px;
  }
  .select.show &{
    margin-top: -1px;
  }

  .dropdown-item {
    padding: $padding-base-vertical $padding-base-horizontal;
    color: #333333;

  img{
    margin-top: -3px;
  }
  }
  .dropdown-item:focus{
    outline: 0 !important;
  }

  .btn-group.select &{
    min-width: 100%;
  }

  > li:first-child > a{
    border-top-left-radius: $border-radius-extreme;
    border-top-right-radius: $border-radius-extreme;
  }

  > li:last-child > a{
    border-bottom-left-radius: $border-radius-extreme;
    border-bottom-right-radius: $border-radius-extreme;
  }

  .select & > li:first-child > a{
              border-radius: 0;
              border-bottom: 0 none;
            }

  .dropdown-item:hover,
  .dropdown-item:focus {
    background-color: $smoke-bg;
    color: #333333;
    opacity: 1;
    text-decoration: none;
  }

  &.dropdown-blue > li > a:hover,
  &.dropdown-blue > li > a:focus{
     background-color: $light-blue;
   }
  &.dropdown-azure > li > a:hover,
  &.dropdown-azure > li > a:focus{
     background-color: $light-azure;
   }
  &.ct-green > li > a:hover,
  &.ct-green > li > a:focus{
     background-color: $light-green;
   }
  &.dropdown-orange > li > a:hover,
  &.dropdown-orange > li > a:focus{
     background-color: $light-orange;
   }
  &.dropdown-red > li > a:hover,
  &.dropdown-red > li > a:focus{
     background-color: $light-red;
   }

  .dropdown-item{
  i[class*="nc-icon"]{
    font-size: 18px;
    text-align: center;
    line-height: 25px;
    float: left;
    padding-right: 10px;
  }
  }

  &.dropdown-menu-right{
  &:before,
  &:after{
     right: 12px !important;
     left: auto !important;
   }
  }

  }

  .dropdown-with-icons{
  > li > a{
    padding-left: 0px;
    line-height: 28px;
  }
  i{
    text-align: center;
    line-height: 28px;
    float: left;

  &[class^="pe-"]{
     font-size: 24px;
     width: 46px;
   }
  &[class^="fa"]{
     font-size: 14px;
     width: 38px;
   }
  }
  }

  //fix bug for the select items in btn-group
    .btn-group.select{
      overflow: hidden;
    }
  .btn-group.select.show{
    overflow: visible;
  }

  @media(max-width: 991px){
    .dropdown-menu {
      display: none;
    }
    .dropdown-menu.show{
     display: block;
    }
  }
</style>
