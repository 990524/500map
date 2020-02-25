# 500map

## 拷贝`.env`文件

```shell script
cp .env.exmaple .env
```

## 配置高德地图TOKEN

打开`.env`文件，设置`VUE_APP_AMAP_KEY`为你的高德地图应用Key值
 
参考: https://lbs.amap.com/dev/key/app

```dotenv
VUE_APP_AMAP_KEY = <your key>
```

## 安装依赖
```
npm install
```

### 开发环境编译
```
npm run serve
```

### 生产环境编译
```
npm run build
```

### EsLint代码风格检查
```
npm run lint
```

### 更多自定义配置
See [Configuration Reference](https://cli.vuejs.org/config/).
