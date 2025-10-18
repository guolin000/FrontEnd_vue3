<template>
  <div class="app-wrapper">
    <el-container>
      <el-aside width="200px" class="sidebar-container"><Menu/></el-aside>
      <el-container>
        <el-header><Header/></el-header>
        <el-main>
          <Tabs/>
          <router-view/>
        </el-main>
        <el-footer><Footer/></el-footer>
      </el-container>
    </el-container>
  </div>
</template>


<script setup>
import Menu from '@/layout/menu'
import Header from '@/layout/header'
import Footer from '@/layout/footer'
import Tabs from '@/layout/tabs'
</script>

<style scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.sidebar-container {
  background-color: #E3F9FD;
  height: 100%;
  width: 12.8%;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
  margin-right: 5px;
  border-radius: 50px;
}

.el-container{
  height:100%
}

.el-header{
  padding-left: 0px;
  padding-right: 0px;
}

:deep(ul.el-menu){
  border-right-width: 0px
}

</style>
