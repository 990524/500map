# under-map

> 基于`vue全家桶`及`@antv/l7`构建的地图管理项目demo

### 主要功能

- 地图缩放
- 3D视角切换
- 底图动态切换
- 叠加图层动态切换
- 支持全屏
- 支持POI搜索并跳转

界面展示:

![under-map](https://tva1.sinaimg.cn/large/007S8ZIlgy1geivcem11yj31am0qc7cy.jpg)
![under-map](https://tva1.sinaimg.cn/large/007S8ZIlgy1geivbzh0ovj31am0qcqv5.jpg)
![under-map](https://tva1.sinaimg.cn/large/007S8ZIlgy1geive0gkj2j31an0qcu0x.jpg)

# 项目部署流程

### 初始化环境配置

**拷贝`.env`文件**

```shell script
cp .env.exmaple .env
```

**配置高德地图**

打开`.env`文件，设置`VUE_APP_AMAP_KEY`为你的高德地图应用Key值,参考: [高德地图API](https://lbs.amap.com/dev/key/app)

```dotenv
VUE_APP_AMAP_KEY=<your key>
```

### 编译部署

**安装npm依赖**
```
npm install
```

**开发环境编译**
```
npm run serve
```

**生产环境编译**
```
npm run build
```

**EsLint代码风格检查**
```
npm run lint
```

### 使用Docker部署

**安装依赖并编译**

```shell script
docker run --rm -it -v$(pwd):/app -w/app node npm i --registry https://registry.npm.taobao.org && npm run build
```

**编译镜像并启动**

```shell script
docker-compose up -d
```

> 默认`nginx`端口为8888，打开[http://127.0.0.1:8888](http://127.0.0.1:8888)即可访问
