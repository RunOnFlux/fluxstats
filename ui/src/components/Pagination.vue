<template>
  <ul
    class="pagination"
    :class="paginationClass"
  >
    <li
      class="page-item prev-page"
      :class="{disabled: value === 1}"
    >
      <a
        class="page-link"
        aria-label="Previous"
        @click="prevPage"
      >
        <span>«</span>
      </a>
    </li>
    <li
      v-for="item in range(minPage, maxPage)"
      :key="item"
      class="page-item"
      :class="{active: value === item}"
    >
      <a
        class="page-link"
        @click="changePage(item)"
      >{{ item }}</a>
    </li>
    <li
      class="page-item page-pre next-page"
      :class="{disabled: value === totalPages}"
    >
      <a
        class="page-link"
        aria-label="Next"
        @click="nextPage"
      >
        <span>»</span>
      </a>
    </li>
  </ul>
</template>
<script>
export default {
  name: 'LPagination',
  props: {
    color: {
      type: String,
      default: '',
      validator: (value) => ['', 'blue', 'azure', 'green', 'orange', 'red', 'purple'].includes(value),
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    perPage: {
      type: Number,
      default: 10,
    },
    total: {
      type: Number,
      default: 0,
    },
    value: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      defaultPagesToDisplay: 5,
    };
  },
  computed: {
    paginationClass() {
      return `pagination-${this.color}`;
    },
    totalPages() {
      if (this.pageCount > 0) return this.pageCount;
      if (this.total > 0) {
        return Math.ceil(this.total / this.perPage);
      }
      return 1;
    },
    pagesToDisplay() {
      if (this.totalPages > 0 && this.totalPages < this.defaultPagesToDisplay) {
        return this.totalPages;
      }
      return this.defaultPagesToDisplay;
    },
    minPage() {
      if (this.value >= this.pagesToDisplay) {
        const pagesToAdd = Math.floor(this.pagesToDisplay / 2);
        const newMaxPage = pagesToAdd + this.value;
        if (newMaxPage > this.totalPages) {
          return this.totalPages - this.pagesToDisplay + 1;
        }
        return this.value - pagesToAdd;
      }
      return 1;
    },
    maxPage() {
      if (this.value >= this.pagesToDisplay) {
        const pagesToAdd = Math.floor(this.pagesToDisplay / 2);
        const newMaxPage = pagesToAdd + this.value;
        if (newMaxPage < this.totalPages) {
          return newMaxPage;
        }
        return this.totalPages;
      }
      return this.pagesToDisplay;
    },
  },
  watch: {
    perPage(value) {
      this.$emit('input', 1);
    },
    total(value) {
      this.$emit('input', 1);
    },
  },
  methods: {
    range(min, max) {
      const arr = [];
      for (let i = min; i <= max; i += 1) {
        arr.push(i);
      }
      return arr;
    },
    changePage(item) {
      this.$emit('input', item);
    },
    nextPage() {
      if (this.value < this.totalPages) {
        this.$emit('input', this.value + 1);
      }
    },
    prevPage() {
      if (this.value > 1) {
        this.$emit('input', this.value - 1);
      }
    },
  },
};
</script>
