<template>
  <nav aria-label="Page navigation" class="pagination-container">
    <ul class="pagination">
      <li class="page-item" :class="{ disabled: currentPage <= 1 }">
        <a class="page-link" href="#" @click.prevent="changePage(1)">First</a>
      </li>
      <li class="page-item" :class="{ disabled: currentPage <= 1 }">
        <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
      </li>
      <li class="page-item" v-for="page in pages" :key="page" :class="{ active: page === currentPage }">
        <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
      </li>
      <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
        <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
      </li>
      <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
        <a class="page-link" href="#" @click.prevent="changePage(totalPages)">Last</a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: {
    currentPage: Number,
    totalPages: Number,
  },
  computed: {
    pages() {
      const range = 5; // Number of pages to display in pagination
      let start = this.currentPage - Math.floor(range / 2);
      start = Math.max(start, 1);
      start = Math.min(start, Math.max(1, this.totalPages - range + 1));

      const end = Math.min(start + range - 1, this.totalPages);

      return Array.from({ length: (end - start) + 1 }, (_, i) => start + i);
    },
  },

  methods: {
    changePage(page) {
      if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
        this.$emit('change-page', page);
      }
    },
  },
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
}

.page-item {
  margin: 0 2px;
}

.page-item.disabled .page-link,
.page-item.active .page-link {
  pointer-events: none;
}

.page-link {
  display: block;
  padding: 5px 10px;
  border-radius: 5px;
  text-decoration: none;
  color: #007bff;
  border: 1px solid #dee2e6;
}

.page-link:hover {
  background-color: #f8f9fa;
}

.page-item.active .page-link {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
