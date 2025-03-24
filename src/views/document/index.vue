<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-row class="header">
      <el-button type="success" :icon="DocumentAdd" @click="handleAddBook">新增</el-button>
    </el-row>
    <!-- 书籍列表 -->
    <el-table
      :data="bookList"
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="title" label="书名" width="150" align="center" />
      <el-table-column prop="author" label="作者" width="120" align="center" />
      <el-table-column prop="dynasty" label="朝代" width="120" align="center" />
      <el-table-column prop="action" label="操作" width="200" fixed="right" align="center">
        <template #default="scope">
          <el-button type="primary" :icon="Edit" @click="handleEditBook(scope.row)">编辑</el-button>
          <el-popconfirm title="您确定要删除这本书吗？" @confirm="handleDeleteBook(scope.row.id)">
            <template #reference>
              <el-button type="danger" :icon="Delete">删除</el-button>
            </template>
          </el-popconfirm>
          <el-button type="info" :icon="View" @click="handleViewBook(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增/编辑书籍对话框 -->
    <el-dialog :visible.sync="dialogVisible" title="书籍信息">
      <template #content>
        <el-form :model="formData" label-width="80px">
          <el-form-item label="书名">
            <el-input v-model="formData.title" placeholder="请输入书名" />
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="formData.author" placeholder="请输入作者" />
          </el-form-item>
          <el-form-item label="朝代">
            <el-input v-model="formData.dynasty" placeholder="请输入朝代" />
          </el-form-item>
          <el-form-item label="书籍文件">
            <el-upload
              :action="uploadUrl"
              :on-success="handleUploadSuccess"
              :show-file-list="false"
              accept=".txt"
            >
              <el-button type="primary">选择文件</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveBook">保存</el-button>
      </template>
    </el-dialog>
    <!-- 查看书籍内容对话框 -->
    <el-dialog :visible.sync="viewDialogVisible" title="书籍内容">
      <template #content>
        <pre class="book-content">{{ viewBookContent }}</pre>
      </template>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DocumentAdd, Edit, Delete, View } from '@element-plus/icons-vue'

// 模拟书籍列表
const bookList = ref([
  { id: 1, title: '书籍1', author: '作者1', dynasty: '唐朝', content: '书籍内容1' },
  { id: 2, title: '书籍2', author: '作者2', dynasty: '宋朝', content: '书籍内容2' },
])

// 对话框相关状态
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const formData = ref({ id: null, title: '', author: '', dynasty: '', content: '' })
const viewBookContent = ref('')

// 上传文件相关
const uploadUrl = 'your_upload_api_url'

// 处理新增书籍
const handleAddBook = () => {
  formData.value = { id: null, title: '', author: '', dynasty: '', content: '' }
  dialogVisible.value = true
}

// 处理编辑书籍
const handleEditBook = (book) => {
  formData.value = { ...book }
  dialogVisible.value = true
}

// 处理删除书籍
const handleDeleteBook = (id) => {
  bookList.value = bookList.value.filter((book) => book.id !== id)
}

// 处理查看书籍
const handleViewBook = (book) => {
  viewBookContent.value = book.content
  viewDialogVisible.value = true
}

// 处理保存书籍
const handleSaveBook = () => {
  if (formData.value.id) {
    // 编辑
    const index = bookList.value.findIndex((book) => book.id === formData.value.id)
    if (index !== -1) {
      bookList.value[index] = { ...formData.value }
    }
  } else {
    // 新增
    const newId = bookList.value.length > 0 ? bookList.value[bookList.value.length - 1].id + 1 : 1
    formData.value.id = newId
    bookList.value.push({ ...formData.value })
  }
  dialogVisible.value = false
}

// 处理文件上传成功
const handleUploadSuccess = (response, file, fileList) => {
  // 假设响应中包含文件内容
  formData.value.content = response.content
}

// 处理表格选中项变化
const handleSelectionChange = (selection) => {
  // 可根据需要处理选中项
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.book-content {
  white-space: pre-wrap;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}
</style>