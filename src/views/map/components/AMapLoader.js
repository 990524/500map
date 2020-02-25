export default function MapLoader() {
  console.log('mapLoader...')
  return new Promise((resolve, reject) => {
    const key = process.env.VUE_APP_AMAP_TOKEN
    const callback = 'initAMap'
    const script = document.createElement('script')

    const params = {
      v: '1.4.15',
      callback,
      key,
      plugin: [
        'AMap.DistrictLayer',
        'AMap.Scale',
        'AMap.ToolBar',
        'AMap.OverView',
        'AMap.ControlBar',
        'AMap.Geocoder',
        'AMap.Autocomplete',
        'AMap.PlaceSearch'
      ].join(',')
    }

    const httpQuery = Object.keys(params).reduce((res, key) => `${res}${res ? '&' : ''}${key}=${params[key]}`, '')

    script.type = 'text/javascript'
    script.async = true
    script.src = `http://webapi.amap.com/maps?${httpQuery}`
    script.onerror = reject
    document.head.appendChild(script)

    window.initAMap = () => {
      resolve(window.AMap)
    }
  })
}
