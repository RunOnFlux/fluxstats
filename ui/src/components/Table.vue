<template>
  <table class="table">
    <thead>
      <slot name="columns">
        <th
          v-for="column in columns"
          :key="column"
        >
          {{ column }}
        </th>
      </slot>
    </thead>
    <tbody>
      <tr
        v-for="(item, i) in data"
        :key="i"
      >
        <slot :row="item">
          <template v-for="column in columns">
            <td
              v-if="hasValue(item, column)"
              :key="column"
            >
              {{ itemValue(item, column) }}
            </td>
          </template>
        </slot>
      </tr>
    </tbody>
  </table>
</template>
<script>
export default {
  name: 'LTable',
  props: {
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  methods: {
    hasValue(item, column) {
      return item[column.toLowerCase()] !== 'undefined';
    },
    itemValue(item, column) {
      return item[column.toLowerCase()];
    },
  },
};
</script>
<style>
</style>
