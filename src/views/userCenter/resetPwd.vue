<template>
  <el-form ref="pwdRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
           <el-input v-model="form.oldPassword" placeholder="请输入旧密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
           <el-input v-model="form.newPassword" placeholder="请输入新密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
           <el-input v-model="form.confirmPassword" placeholder="请确认密码" type="password" show-password/>
        </el-form-item>
        <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存</el-button>

        </el-form-item>
   </el-form>
</template>

<script setup>
import {defineEmits, defineProps, ref, watch} from "vue";
import requestUtil,{getServerUrl} from "@/utils/request";
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import store from "@/store";
import Cookies from "js-cookie";
import {encrypt} from "@/utils/jsencrypt";
import qs from "qs";
import router from "@/router";

const props=defineProps(
    {
      user:{
        type:Object,
        default:()=>{},
        required:true
      }
    }
)

const form=ref({
  id:-1,
  oldPassword:'',
  newPassword:'',
  confirmPassword:''
})

const pwdRef=ref(null)

form.value=props.user;


const equalToPassword = (rule, value, callback) => {
  if (form.value.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = ref({
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  newPassword: [{ required: true, message: "新密码不能为空", trigger: "blur" }, { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "确认密码不能为空", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});


const handleSubmit=()=>{

  pwdRef.value.validate(async (valid)=>{
    if(valid) {
      let result = await requestUtil.post("user/updateUserPwd", form.value);
      let data = result.data;
      if (data.code == 200) {
        ElMessage.success("密码修改成功，下一次登录生效！")
        store.commit("SET_USERINFO", form.value)
      }else{
        ElMessage.error(data.errorInfo)
      }
    }
  })
}



</script>

<style scoped>

</style>
