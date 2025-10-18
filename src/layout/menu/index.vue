<template>
  <el-menu
      active-text-color="#4669EA"
      background-color="#E3F9FD"
      class="el-menu-vertical-demo"
      text-color="#2D2D2D"
      router
      :default-active="activeIndex"
  >
    <el-menu-item index="/index" @click="openTab({name:'首页',path:'/index'})">
      <el-icon><home-filled /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-sub-menu :index="menu.path" v-for="menu in menuList">
      <template #title >
        <el-icon><svg-icon :icon="menu.icon" /></el-icon>
        <span>{{menu.name}}</span>
      </template>
      <el-menu-item :index="item.path" v-for="item in menu.children" @click="openTab(item)">
        <el-icon><svg-icon :icon="item.icon" /></el-icon>
        <span>{{item.name}}</span>
      </el-menu-item>
    </el-sub-menu>

  </el-menu>
</template>

<script setup>
import {HomeFilled,User,Tickets,Goods,DocumentAdd,Management,Setting,Edit,SwitchButton,Promotion} from '@element-plus/icons-vue'

import { ref ,watch} from 'vue'
import store from '@/store'
import { useRoute,useRouter } from 'vue-router'


const menuList = ref(store.getters.GET_MENULIST);

const openTab=(item)=>{
  store.commit('ADD_TABS',item)
}

const activeIndex=ref("/index")



watch(store.state,()=>{
  console.log("editableTabsValue="+store.state.editableTabsValue)
  activeIndex.value=store.state.editableTabsValue
},{deep:true,immediate:true})


</script>

<style lang="scss" scoped>
// 引入现代化字体（可选：通过 CDN 或本地字体文件）
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

// 自定义菜单项的全局样式
.el-menu {
  border-right: none; // 移除默认边框，保持简洁
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; // 现代化字体
}

// 菜单项和子菜单标题的 span 样式
.el-menu-item span,
.el-sub-menu__title span {
  font-size: 17px; // 稍小的字体，保持简洁
  font-weight: 620; // 中等字重，现代感
  letter-spacing: 0.2px; // 微调字距，提升可读性
  color: #2D2D2D; // 比纯黑 (#000000) 略柔和的文字颜色
  transition: all 0.3s ease; // 平滑过渡动画
}

// 悬停效果
.el-menu-item:hover span,
.el-sub-menu__title:hover span {
  color: #4669EA; // 与 active-text-color 一致
  transform: translateX(4px); // 轻微右移，增加动感
}

// 激活状态
.el-menu-item.is-active span {
  font-weight: 600; // 加粗，突出选中状态
  color: #4669EA; // 激活颜色
  position: relative;
  // 添加下划线动画效果
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #4669EA;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  &.is-active::after {
    transform: scaleX(1); // 激活时显示下划线
  }
}

// 子菜单项的缩进和间距优化
.el-menu-item {
  padding-left: 40px !important; // 增加缩进，层次感更强
  &.is-active {
    background-color: rgba(70, 105, 234, 0.1); // 激活时添加浅色背景
    border-radius: 6px; // 圆角，现代感
  }
}

// 子菜单标题的样式微调
.el-sub-menu__title {
  padding-left: 20px !important; // 主菜单标题稍左对齐
}

// 动画效果：点击反馈
.el-menu-item {
  transition: background-color 0.2s ease, transform 0.2s ease;
  &:active {
    transform: scale(0.98); // 轻微缩放，模拟点击反馈
  }
}

// 优化图标与文字的间距
.el-icon + span {
  margin-left: 8px; // 图标与文字间距
}
</style>
