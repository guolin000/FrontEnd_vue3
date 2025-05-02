<template>
  <div class="container">
    <div class="left-panel" :style="{ width: leftWidth + 'px' }">
      <div class="input-section">
        <a-textarea
          v-model:value="inputText"
          placeholder="请输入需要抽取的文本"
          :rows="10"
        />
        <a-button
          type="primary"
          @click="predict"
          :loading="loading"
          class="predict-btn"
        >
          {{ loading ? '抽取中...' : '实体与关系抽取' }}
        </a-button>
      </div>
      <div class="result-section">
        <a-card v-if="resultData" hoverable>
          <pre>{{ JSON.stringify(resultData, null, 2) }}</pre>
        </a-card>
      </div>
    </div>
    <div class="splitter" @mousedown="startDragging"></div>
    <div class="right-panel">
      <div class="chart-container" ref="chartContainer"></div>
      <a-button type="primary" @click="saveData" class="save-btn">
        保存预测数据
      </a-button>
    </div>
    <a-modal v-model:visible="loading" :footer="null" :closable="false" centered>
      <div class="loading-content">
        <a-spin size="large" />
        <p>正在加载...</p>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import requestUtil from '@/utils/request';
import { message } from 'ant-design-vue';

export default {
  name: 'EntityRelation',
  setup() {
    const inputText = ref('');
    const resultData = ref(null);
    const loading = ref(false);
    const chartContainer = ref(null);
    const leftWidth = ref(500);
    const chartInstance = ref(null);

    // 初始化图谱
    const initChart = () => {
      if (chartContainer.value) {
        chartInstance.value = echarts.init(chartContainer.value);
      } else {
        console.error('Chart container is not available');
      }
    };

    // 预测函数
    const predict = async () => {
      if (!inputText.value.trim()) {
        message.warning('请输入文本');
        return;
      }
      loading.value = true;
      try {
        const response = await requestUtil.post('/info_extract/predict', {
          text: inputText.value
        });
        if (response.data.code === 0) {
          resultData.value = response.data.data;
          updateChart(response.data.data);
        } else {
          throw new Error(response.data.message || '后端返回错误');
        }
      } catch (error) {
        message.error('预测失败：' + error.message);
        console.error('Prediction error:', error);
      } finally {
        loading.value = false;
      }
    };

    // 更新图谱
    const updateChart = (data) => {
      if (!data || !data.entities || !data.relations) {
        console.error('Invalid data for chart:', data);
        message.error('数据格式错误，无法生成图谱');
        return;
      }
      const option = {
        title: { text: '实体关系图谱' },
        tooltip: {},
        series: [
          {
            type: 'graph',
            layout: 'force',
            data: data.entities.map((entity) => ({
              name: entity.text,
              category: entity.type
            })),
            links: data.relations.map((rel) => ({
              source: rel.source,
              target: rel.target,
              label: { show: true, formatter: rel.type }
            })),
            categories: [...new Set(data.entities.map((e) => e.type))].map((type) => ({ name: type })),
            roam: true,
            label: { show: true },
            force: { repulsion: 100 }
          }
        ]
      };
      if (chartInstance.value) {
        chartInstance.value.setOption(option);
      } else {
        console.error('Chart instance is not initialized');
      }
    };

    // 保存数据
    const saveData = async () => {
      if (!resultData.value) {
        message.warning('暂无预测数据可保存');
        return;
      }
      try {
        const saveData = {
          input_text: inputText.value,
          result: resultData.value,
          user_id: 1 // 假设用户ID为1，实际应从登录状态获取
        };
        await requestUtil.post('/info_extract/save', saveData);
        message.success('保存成功');
      } catch (error) {
        message.error('保存失败：' + error.message);
      }
    };

    // 分割线拖动
    const startDragging = (e) => {
      const startX = e.clientX;
      const startWidth = leftWidth.value;
      const moveHandler = (moveEvent) => {
        leftWidth.value = Math.max(300, Math.min(800, startWidth + moveEvent.clientX - startX));
        if (chartInstance.value) {
          chartInstance.value.resize();
        }
      };
      const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    };

    onMounted(() => {
      initChart();
    });

    return {
      inputText,
      resultData,
      loading,
      predict,
      saveData,
      chartContainer,
      leftWidth,
      startDragging
    };
  }
};
</script>

<style scoped>
.container {
  display: flex;
  height: 83vh;
  position: relative;
}

.left-panel {
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
}

.input-section {
  padding: 20px;
  flex: 0 0 auto;
}

.result-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.predict-btn {
  width: 100%;
  margin-top: 10px;
}

.right-panel {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.chart-container {
  flex: 1;
  width: 100%;
}

.save-btn {
  margin-top: 10px;
}

.splitter {
  width: 5px;
  background: #dcdcdc;
  cursor: ew-resize;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
