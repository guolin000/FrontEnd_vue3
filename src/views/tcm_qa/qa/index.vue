<template>
  <div class="tcm-qa-container">
    <!-- 左侧问答区域 -->
    <div class="left-panel" :style="{ width: `${leftWidth}%` }">
      <div class="chat-container">
        <a-list :data-source="messages" class="message-list">
          <template #renderItem="{ item }">
            <a-list-item :class="item.type === 'user' ? 'user-message' : 'system-message'">
              <div>{{ item.content }}</div>
            </a-list-item>
          </template>
        </a-list>
      </div>
      <div class="input-container">
        <a-textarea v-model:value="inputText" placeholder="请输入您的问题" rows="2" />
        <a-button
          type="primary"
          shape="circle"
          @click="sendMessage"
          class="send-btn"
          :loading="isLoading"
        >
          <SendOutlined v-if="!isLoading" />
        </a-button>
      </div>
    </div>

    <!-- 滑动分隔条 -->
    <div class="splitter" @mousedown="startDragging" @dragstart.prevent></div>

    <!-- 右侧图谱区域 -->
    <div class="right-panel" :style="{ width: `${100 - leftWidth}%` }">
      <div ref="chartContainer" class="chart-container"></div>
    </div>

    <!-- 加载提示框 -->
    <a-modal
      v-model:visible="isLoading"
      :footer="null"
      :closable="false"
      centered
      width="300px"
      class="loading-modal"
    >
      <div class="loading-content">
        <a-spin />
        <span>正在生成答案...</span>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { SendOutlined } from '@ant-design/icons-vue';
import * as echarts from 'echarts';
import requestUtil from '@/utils/request';

// 状态管理
const leftWidth = ref(50);
const messages = ref([]);
const inputText = ref('');
const isLoading = ref(false);
let chartInstance = null;

// 图谱容器
const chartContainer = ref(null);

// 初始化 ECharts
onMounted(() => {
  chartInstance = echarts.init(chartContainer.value);
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  if (chartInstance) {
    chartInstance.dispose();
  }
});

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim()) return;

  messages.value.push({ type: 'user', content: inputText.value });
  isLoading.value = true;

  try {
    const response = await requestUtil.post('/tcm-qa/ask/', { question: inputText.value }, {
      timeout: 60000, // 单次请求超时设置为 60 秒
    });
    console.log('后端返回数据:', response.data); // 调试日志
    messages.value.push({ type: 'system', content: response.data.answer });
    updateChart(response.data.graph); // 使用 response.data.graph
  } catch (error) {
    console.error('请求失败:', error);
    if (error.code === 'ECONNABORTED') {
      messages.value.push({ type: 'system', content: '请求超时，请稍后重试！' });
    } else {
      messages.value.push({ type: 'system', content: '抱歉，查询失败！' });
    }
  } finally {
    isLoading.value = false;
    inputText.value = '';
    await nextTick(); // 确保 DOM 更新后再滚动
    scrollToBottom();
  }
};

// 更新图谱
const updateChart = (graphData) => {
  if (!graphData || !graphData.nodes || !graphData.edges) {
    console.error('图谱数据无效:', graphData);
    return;
  }

  console.log('图谱数据:', graphData); // 调试日志

  // 定义实体类型及其颜色（与后端一致）
  const categories = [
    { name: '症状', itemStyle: { color: '#3498DB' } },
    { name: '中医疾病', itemStyle: { color: '#FF6B6B' } },
    { name: '方剂', itemStyle: { color: '#96CEB4' } },
    { name: '中药', itemStyle: { color: '#FFEEAD' } },
    { name: '病因', itemStyle: { color: '#45B7D1' } },
    { name: '用法', itemStyle: { color: '#D4A5A5' } },
    { name: '治法', itemStyle: { color: '#F1C40F' } },
    { name: '功效', itemStyle: { color: '#34495E' } },
    { name: '炮制方法', itemStyle: { color: '#E67E22' } },
    { name: '服法', itemStyle: { color: '#9B59B6' } },
    { name: '人物', itemStyle: { color: '#4ECDC4' } },
    { name: '病机', itemStyle: { color: '#2ECC71' } },
    { name: '煎法', itemStyle: { color: '#8E44AD' } },
    { name: '脉象', itemStyle: { color: '#E74C3C' } },
    { name: '加减化裁', itemStyle: { color: '#16A085' } },
    { name: '人群', itemStyle: { color: '#F39C12' } },
    { name: '著作', itemStyle: { color: '#2980B9' } },
    { name: '预后', itemStyle: { color: '#D35400' } }
  ];

  const option = {
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          return `${params.data.category}: ${params.data.name}`;
        } else {
          return `关系: ${params.data.value}`;
        }
      }
    },
    legend: {
      data: categories.map(cat => cat.name),
      bottom: 10,
      type: 'scroll',
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: graphData.nodes.map((node) => ({
          id: node.id, // 使用后端的 id 字段
          name: node.label, // 显示的名称
          category: categories.findIndex(cat => cat.name === node.type), // 使用索引映射类别
          symbolSize: 30,
        })),
        links: graphData.edges.map((edge) => ({
          source: edge.from, // 使用 from 作为源节点 ID
          target: edge.to, // 使用 to 作为目标节点 ID
          value: edge.relationship, // 关系名称
          lineStyle: { width: 2 }
        })),
        categories: categories,
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}' // 显示节点名称
        },
        force: {
          repulsion: 150,
          edgeLength: 80,
          gravity: 0.1
        },
        edgeLabel: {
          show: true,
          formatter: '{c}', // 显示关系名称
          fontSize: 12
        }
      }
    ],
    animation: true,
    animationDuration: 1000,
  };

  console.log('ECharts 配置:', option); // 调试日志
  chartInstance.setOption(option, true);
  resizeChart(); // 确保图表适配容器
};

// 自适应图表大小
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 优化后的拖动逻辑
const startDragging = (e) => {
  e.preventDefault();
  const container = document.querySelector('.tcm-qa-container');
  const totalWidth = container.offsetWidth;

  let rafId = null;

  const onMouseMove = (moveEvent) => {
    moveEvent.preventDefault();
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      const newWidth = (moveEvent.clientX / totalWidth) * 100;
      leftWidth.value = Math.max(20, Math.min(80, newWidth));
      resizeChart();
      rafId = null;
    });
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };

  document.addEventListener('mousemove', onMouseMove, { passive: false });
  document.addEventListener('mouseup', onMouseUp);
};

// 自动滚动到底部
const scrollToBottom = () => {
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
};
</script>

<style scoped>
.tcm-qa-container {
  display: flex;
  height: 83vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  position: relative;
}

.left-panel {
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  scroll-behavior: smooth;
}

.message-list {
  min-height: 0;
}

.user-message {
  text-align: right;
  color: #1890ff;
}

.system-message {
  text-align: left;
  color: #555;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.send-btn {
  background: linear-gradient(45deg, #1890ff, #40c4ff);
  border: none;
}

.splitter {
  width: 6px;
  background: #d9d9d9;
  cursor: col-resize;
  transition: background 0.3s;
  user-select: none;
  -webkit-user-select: none;
}

.splitter:hover {
  background: #1890ff;
}

.right-panel {
  padding: 20px;
}

.chart-container {
  width: 100%;
  height: 100%;
}

/* 加载提示框样式 */
.loading-modal :deep(.ant-modal-content) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 20px;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #666;
}
</style>
