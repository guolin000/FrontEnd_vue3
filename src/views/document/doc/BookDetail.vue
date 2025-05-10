<!-- src/views/document/doc/BookDetail.vue -->
<template>
  <div class="book-detail">
    <!-- 回退按钮 -->
    <el-button class="back-button" type="primary" @click="goBack">
      返回
    </el-button>
    <div class="book-content">
      <div class="book-header">
        <div class="book-info">
          <h1>{{ book.title }}</h1>
          <div class="meta">
            <p>作者：{{ book.author }}</p>
            <p>朝代：{{ book.dynasty }}</p>
          </div>
        </div>
<!--        <el-image-->
<!--          v-if="book.cover"-->
<!--          :src="book.cover"-->
<!--          class="cover-image"-->
<!--          fit="contain"-->
<!--          alt="书籍封面"-->
<!--        />-->
      </div>
      <!-- 分页内容 -->
      <div class="pagination-container">
        <div class="page-content" :key="currentPage" v-html="pages[currentPage - 1]"></div>
        <!-- 分页控件 -->
        <div class="pagination-controls">
          <el-button
            :disabled="currentPage <= 1"
            @click="prevPage"
            type="primary"
            class="page-button"
          >
            上一页
          </el-button>
          <el-button
            :disabled="currentPage >= pages.length"
            @click="nextPage"
            type="primary"
            class="page-button"
          >
            下一页
          </el-button>
        </div>
        <!-- Element Plus 分页组件 -->
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="1"
          :total="pages.length"
          layout="total, jumper"
          class="pagination"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    <!-- 回到顶部按钮 -->
<!--    <el-button class="back-to-top" type="primary" circle @click="scrollToTop">-->
<!--      ↑-->
<!--    </el-button>-->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import requestUtil from '@/utils/request';
import { ElMessage } from 'element-plus';

/**
 * 依赖说明：
 * 1. 确保项目已安装 element-plus 和 vue3：
 *    npm install element-plus
 * 2. 在 main.js 中全局注册 element-plus 或按需导入 ElButton、ElImage、ElPagination、ElMessage
 * 3. 无需额外安装第三方翻书组件
 */

const route = useRoute();
const router = useRouter();
const book = ref({});
const bookContent = ref('');
const currentPage = ref(1);

// 分页逻辑：将内容按每页固定行数分割
const linesPerPage = 20; // 每页显示的行数
const pages = computed(() => {
  if (!bookContent.value) return ['<div class="page-inner"></div>'];
  const lines = bookContent.value.split('<br>');
  const result = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    const pageLines = lines.slice(i, i + linesPerPage).join('<br>');
    result.push(`<div class="page-inner">${pageLines}</div>`);
  }
  return result;
});

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// 下一页
const nextPage = () => {
  if (currentPage.value < pages.value.length) {
    currentPage.value++;
  }
};

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};

// 回到顶部
const scrollToTop = () => {
  const scrollContainer =
    document.querySelector('.el-main') ||
    document.querySelector('.book-detail') ||
    document.body;
  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  } else {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
};

// 获取书籍数据
const fetchBook = async () => {
  try {
    const res = await requestUtil.get(`/book/books/${route.params.id}/`);
    book.value = res.data;
    if (book.value.content) {
      bookContent.value = book.value.content.replace(/\n/g, '<br>');
    }
  } catch (error) {
    ElMessage.error('无法加载书籍信息');
    console.error(error);
  }
};

onMounted(fetchBook);
</script>

<style scoped>
.book-detail {
  padding: 30px;
  max-width: 60%;
  max-height: 96%;
  margin: 5px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
}

.book-content {
  margin-top: 40px;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.book-info {
  flex: 1;
}

h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.meta p {
  font-size: 16px;
  color: #666;
  margin: 8px 0;
}

.cover-image {
  max-width: 200px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  position: relative;
  margin-top: -30px;
}

.page-content {
  width: 100%;
  height: 510px;
  background: #fefefe;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow-y: auto;
  padding: 25px;
  line-height: 2;
  font-size: 16px;
  color: #333;
  text-align: justify;
  box-sizing: border-box;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.05);
  animation: flip 0.6s ease;
}

.page-inner {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-family: 'Noto Serif SC', serif; /* 使用适合中文的字体 */
}

.page-inner * {
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

@keyframes flip {
  0% {
    transform: perspective(1200px) rotateY(-15deg);
    opacity: 0.7;
  }
  100% {
    transform: perspective(1200px) rotateY(0deg);
    opacity: 1;
  }
}

.pagination-controls {
  position: absolute;
  bottom: 15px;
  right: 25px;
  display: flex;
  gap: 12px;
}

.page-button {
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 6px;
}

.pagination {
  margin-top: 25px;
  text-align: center;
}

.back-to-top {
  position: fixed;
  right: 30px;
  bottom: 60px;
  width: 60px;
  height: 60px;
  font-size: 24px;
  padding: 0;
  z-index: 1000;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.back-button {
  position: absolute;
  left: 30px;
  top: 20px;
  z-index: 1000;
  padding: 10px 20px;
  border-radius: 6px;
}
</style>
