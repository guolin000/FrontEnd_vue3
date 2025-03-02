<template>
  <el-dialog
      model-value="dialogVisible"
      :title="dialogTitle"
      width="30%"
      @close="handleClose"
  >

    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
    >

      <el-form-item label="菜单类型" prop="menu_type" label-width="100px">
        <el-radio-group v-model="form.menu_type">
          <el-radio :label="'M'">目录</el-radio>
          <el-radio :label="'C'">菜单</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="上级菜单" prop="parent_id">
        <el-select v-model="form.parent_id" placeholder="请选择上级菜单">
          <!-- 当菜单类型为M时显示根目录选项 -->
          <el-option v-if="form.menu_type === 'M'" label="根目录" :value="0"/>
          <template v-for="item in tableData" :key="item.id">
            <el-option :label="item.name" :value="item.id"/>
            <template v-for="child in item.children" :key="child.id">
              <el-option :label="child.name" :value="child.id">
                <span>{{ "    -- " + child.name }}</span>
              </el-option>
            </template>
          </template>
        </el-select>
      </el-form-item>



      <el-form-item label="菜单图标" prop="icon">
        <el-input v-model="form.icon"/>
      </el-form-item>

      <el-form-item label="菜单名称" prop="name">
        <el-input v-model="form.name"/>
      </el-form-item>

      <el-form-item label="权限标识" prop="perms">
        <el-input v-model="form.perms"/>
      </el-form-item>

      <el-form-item label="路由路径" prop="component">
        <el-input v-model="form.path"/>
      </el-form-item>

      <el-form-item label="组件路径" prop="component">
        <el-input v-model="form.component"/>
      </el-form-item>

      <el-form-item label="显示顺序" prop="order_num">
        <el-input-number v-model="form.order_num" :min="1" label="显示顺序"></el-input-number>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark"/>
      </el-form-item>


    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">确认</el-button>
        <el-button @click="handleClose">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>

import {defineEmits, defineProps, ref, watch} from "vue";
import requestUtil, {getServerUrl} from "@/utils/request";
import {ElMessage} from 'element-plus'

const tableData = ref([])


const props = defineProps(
    {
      id: {
        type: Number,
        default: -1,
        required: true
      },
      dialogTitle: {
        type: String,
        default: '',
        required: true
      },
      dialogVisible: {
        type: Boolean,
        default: false,
        required: true
      },
      tableData: {
        type: Array,
        default: [],
        required: true
      }
    }
)


const form = ref({
  id: -1,
  parent_id: null,
  menu_type: "M",
  icon: '',
  name: '',
  perms: '',
  path: '',
  component: '',
  order_num: 1,
  remark: ''
})


const rules = ref({
  parent_id: [
    {required: true, message: '请选择上级菜单'}
  ],
  name: [{required: true, message: "菜单名称不能为空", trigger: "blur"}]
})

const formRef = ref(null)

const initFormData = async (id) => {
  const res = await requestUtil.get("menu/action?id=" + id);
  form.value = res.data.menu;
}


watch(
    () => props.dialogVisible,
    () => {
      let id = props.id;
      tableData.value = props.tableData;
      if (id != -1) {
        initFormData(id)
      } else {
        form.value = {
          id: -1,
          parent_id: null,
          menu_type: "M",
          icon: '',
          name: '',
          perms: '',
          path: '',
          component: '',
          order_num: 1,
          remark: ''
        }
      }
    }
)


const emits = defineEmits(['update:dialogVisible', 'initMenuList'])

const handleClose = () => {
  emits('update:modelValue', false)
}

const handleConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const result = await requestUtil.post("menu/save", form.value);
        const data = result.data;
        if (data.code === 200) {
          ElMessage.success("执行成功！");
          formRef.value.resetFields();
          emits("initMenuList");
          handleClose();
        } else {
          ElMessage.error(data.msg);
        }
      } catch (error) {
        ElMessage.error("保存失败：" + error.message);
      }
    } else {
      console.log("表单验证失败");
    }
  });
};

</script>

<style scoped>

</style>
