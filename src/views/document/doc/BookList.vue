<template>
  <div class="book-list">
    <el-row :gutter="20" class="search-bar">
      <el-col :span="6">
        <el-input v-model="searchParams.title" placeholder="书名" clearable @keyup.enter="fetchBooks" />
      </el-col>
      <el-col :span="6">
        <el-input v-model="searchParams.author" placeholder="作者" clearable @keyup.enter="fetchBooks" />
      </el-col>
      <el-col :span="6">
        <el-input v-model="searchParams.dynasty" placeholder="朝代" clearable @keyup.enter="fetchBooks" />
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="fetchBooks">搜索</el-button>
        <el-button type="success" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="pagination-bar">
      <el-col :span="6">
        <el-select v-model="pageSize" placeholder="每页条数" @change="fetchBooks">
          <el-option label="10" :value="10" />
          <el-option label="20" :value="20" />
          <el-option label="50" :value="50" />
        </el-select>
      </el-col>
    </el-row>

    <el-table :data="books" style="width: 100%" stripe :default-sort="{ prop: 'title', order: 'ascending' }" height="500">
      <el-table-column prop="title" label="书名" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="dynasty" label="朝代" />
      <el-table-column prop="year" label="年份" />
      <el-table-column label="封面">
        <template #default="scope">
          <el-image :src="scope.row.cover" style="width: 50px; height: 50px" fit="cover" lazy />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          <el-button size="small" type="primary" @click="handleView(scope.row.id)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="fetchBooks"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="isEdit ? '编辑书籍' : '新增书籍'" v-model="dialogVisible" width="30%" @close="resetForm">
      <el-form :model="form" label-width="80px">
        <el-form-item label="书名">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" />
        </el-form-item>
        <el-form-item label="朝代">
          <el-input v-model="form.dynasty" />
        </el-form-item>
        <el-form-item label="年份">
          <el-input v-model.number="form.year" />
        </el-form-item>
        <el-form-item label="封面">
          <el-upload :auto-upload="false" :on-change="handleCoverChange" :show-file-list="false">
            <el-button>上传封面</el-button>
          </el-upload>
          <div v-if="coverUploaded" class="upload-success">
            <el-icon :size="20" color="green"><Check /></el-icon>
            <span>{{ form.cover.name}}</span>
          </div>
        </el-form-item>
        <el-form-item label="内容">
          <el-upload :auto-upload="false" :on-change="handleContentChange" :show-file-list="false">
            <el-button>上传TXT文件</el-button>
          </el-upload>
          <div v-if="contentUploaded" class="upload-success">
            <el-icon :size="20" color="green"><Check /></el-icon>
            <span>{{ form.content_file.name}}</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import requestUtil from '@/utils/request';
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';

const router = useRouter();
const books = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchParams = ref({ title: '', author: '', dynasty: '' });
const dialogVisible = ref(false);
const isEdit = ref(false);
const form = ref({ id: null, title: '', author: '', dynasty: '', year: '', cover: null, content_file: null });
const coverUploaded = ref(false);
const contentUploaded = ref(false);

const fetchBooks = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchParams.value.title || searchParams.value.author || searchParams.value.dynasty,
    };
    const res = await requestUtil.get('/book/books/', params);
    books.value = res.data.results;
    total.value = res.data.count;
  } catch (error) {
    ElMessage.error('获取书籍列表失败');
    console.error(error);
  }
};

const handleAdd = () => {
  isEdit.value = false;
  resetForm(); // 重置表单
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEdit.value = true;
  dialogVisible.value = true;
  form.value = { ...row };
  coverUploaded.value = !!row.cover;
  contentUploaded.value = !!row.content_file;
};

const handleDelete = async (id) => {
  try {
    await requestUtil.del(`/book/books/${id}/`);
    ElMessage.success('删除成功');
    fetchBooks();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const handleView = (id) => {
  router.push(`/book/${id}`);
};

const handleCoverChange = (file) => {
  form.value.cover = file.raw;
  coverUploaded.value = true;
};

const handleContentChange = (file) => {
  form.value.content_file = file.raw;
  contentUploaded.value = true;
};

const resetForm = () => {
  form.value = {id: null, title: '', author: '', dynasty: '', year: '', cover: null, content_file: null};
  coverUploaded.value = false;
  contentUploaded.value = false;
};

const submitForm = async () => {
  try {
    const formData = new FormData();
    const fields = ['title', 'author', 'dynasty', 'year'];

    fields.forEach((key) => {
      if (form.value[key] !== null && form.value[key] !== '') {
        formData.append(key, form.value[key]);
      }
    });

    if (form.value.cover instanceof File) {
      formData.append('cover', form.value.cover);
    }
    if (form.value.content_file instanceof File) {
      formData.append('content_file', form.value.content_file);
    }

    if (isEdit.value) {
      await requestUtil.put(`/book/books/${form.value.id}/`, formData);
      ElMessage.success('更新成功');
    } else {
      await requestUtil.fileUpload('/book/books/', formData);
      ElMessage.success('添加成功');
    }

    dialogVisible.value = false;
    resetForm(); // 提交成功后重置表单
    fetchBooks();
  } catch (error) {
    ElMessage.error(`操作失败: ${error.response?.data?.detail || error.message}`);
    console.error('提交失败:', error.response?.data || error);
  }
};

onMounted(fetchBooks);
</script>

<style scoped>
.book-list {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.upload-success {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #67c23a;
}

/* 优化表格样式 */
.el-table {
  margin-bottom: 20px;
}

.el-table th {
  background-color: #f5f7fa;
}

.el-table .el-table__row--striped {
  background-color: #fafafa;
}
</style>
