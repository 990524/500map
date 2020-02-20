<template>
  <Card :bordered="false">
    <p slot="title" class="title">
      <span>{{ data.provinceName }}</span>
      <span class="close" @click="$emit('close')">
        <Icon type="ios-close-circle-outline" />
      </span>
    </p>
    <div class="content">
      <div class="statistics">
        <div class="counts">
          <div class="confirmed">
            <div class="count">
              <span class="value">{{ data.confirmedCount }}</span>
              <span class="unit">例</span>
            </div>
            <div class="title">确诊</div>
          </div>
          <div class="suspected">
            <div class="count">
              <span class="value">{{ data.suspectedCount }}</span>
              <span class="unit">例</span>
            </div>
            <div class="title">疑似</div>
          </div>
          <div class="cured">
            <div class="count">
              <span class="value">{{ data.curedCount }}</span>
              <span class="unit">例</span>
            </div>
            <div class="title">治愈</div>
          </div>
          <div class="dead">
            <div class="count">
              <span class="value">{{ data.deadCount }}</span>
              <span class="unit">例</span>
            </div>
            <div class="title">死亡</div>
          </div>
        </div>
        <p class="time">最后更新:{{ data.updateTime | updateTime }}</p>
      </div>
      <div class="colors">
        <div class="item">
          <div class="section">>10000</div>
          <div class="color" style="background: #4f080d" />
        </div>
        <div class="item">
          <div class="section">1000 - 9999</div>
          <div class="color" style="background: #76161b" />
        </div>
        <div class="item">
          <div class="section">500 - 999</div>
          <div class="color" style="background: #c92f31" />
        </div>
        <div class="item">
          <div class="section">100 - 499</div>
          <div class="color" style="background: #e26554" />
        </div>
        <div class="item">
          <div class="section">10 - 99</div>
          <div class="color" style="background: #f2a88c" />
        </div>
        <div class="item">
          <div class="section">1 - 9</div>
          <div class="color" style="background: #fbeed3" />
        </div>
        <div class="item">
          <div class="section">0</div>
          <div class="color" style="background: #f5f5f5" />
        </div>
      </div>
      <div class="cities">
        <div v-for="city in data.cities" :key="city.cityName" class="city">
          <p class="name">{{ city.cityName }}</p>
          <p class="count">
            <span class="value">{{ city.confirmedCount }}</span>
            <span class="unit">例</span>
          </p>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
export default {
  name: 'EpidemicDialogCard',
  filters: {
    updateTime(number) {
      const transform = (timestamp, format = 'Y/M/D h:m:s') => {
        const formatNumber = (n) => {
          n = n.toString()
          return n[1] ? n : '0' + n
        }

        var formateArr = ['Y', 'M', 'D', 'h', 'm', 's']
        var returnArr = []

        var date = new Date(number)
        returnArr.push(date.getFullYear())
        returnArr.push(formatNumber(date.getMonth() + 1))
        returnArr.push(formatNumber(date.getDate()))

        returnArr.push(formatNumber(date.getHours()))
        returnArr.push(formatNumber(date.getMinutes()))
        returnArr.push(formatNumber(date.getSeconds()))

        for (var i in returnArr) {
          format = format.replace(formateArr[i], returnArr[i])
        }
        return format
      }

      return transform(number)
    }
  },
  props: {
    data: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .close {
    cursor: pointer;
    &:hover {
      color: #2d8cf0;
    }
  }
}

.content {
  width: 330px;
  max-height: 450px;
  padding: 5px;
  overflow: auto;
  margin-right: -2px;

  &::-webkit-scrollbar {
    width: 2px;
    height: 1px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    background: #c2d7f0;
  }
  &::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  .statistics {
    .counts {
      display: flex;
      justify-content: space-around;
      align-items: center;
      & > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        .count {
          font-weight: bold;
          .value {
            font-size: 1.3rem;
            color: #2d8cf0;
          }
          .unit {
            font-size: .5rem;
          }
        }
        .title {
          font-size: .7rem;
        }
      }
    }

    .time {
      text-align: center;
    }
  }

  .colors {
    display: flex;
    flex-direction: column;
    padding: 10px 30px;
    .item {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      .section {
        font-weight: bold;
      }
      .color {
        width: 12px;
        height: 12px;
        background: #cccccc;
      }
    }
  }

  .cities {
    padding: 10px 30px;
    .city {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      .count {
        font-size: 1.1rem;
        .value {
          color: #2d8cf0;
        }
        .unit {
          margin-left: 3px;
        }
      }
    }
  }
}
</style>
