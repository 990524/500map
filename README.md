# 500map

## 拷贝`.env`文件

```shell script
cp .env.exmaple .env
```

## 配置高德地图TOKEN

打开`.env`文件，设置`VUE_APP_AMAP_KEY`为你的高德地图应用Key值 https://lbs.amap.com/dev/key/app

```dotenv
VUE_APP_AMAP_KEY = 'your key'
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
