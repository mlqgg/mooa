import { StatusEnum } from '../model/constants'

declare const history: History
declare const window: any

export function find(arr: any, func: any) {
  for (let i = 0; i < arr.length; i++) {
    if (func(arr[i])) {
      return arr[i]
    }
  }

  return null
}

export function mooaLog(...args: any[]) {
  if (window['mooa'] && window['mooa']['debug']) {
    console.log(args)
  }
}

// Fixed for IE Custom Event
// https://www.jianshu.com/p/1cf1c80c0586
function MooaCustomEvent(event: any, params: any): any {
  params = params || { bubbles: false, cancelable: false, detail: undefined }
  let evt = document.createEvent('CustomEvent')   //创建新的自定义Event对象
  evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail) //初始化事件对象
  return evt
}

// 该函数的作用是触发自定义事件
export function customEvent(eventName: any, eventArgs?: any) {
  if (typeof window.CustomEvent !== 'function') {
    // 如果浏览器不支持CustomEvent，则封装一个出来挂载在window上
    MooaCustomEvent.prototype = window.Event.prototype
    window.CustomEvent = MooaCustomEvent
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail: eventArgs }))
}

export function navigateAppByName(opts: any): void {
  let navigateToApp: any
  window.apps.map((app: any) => {
    app.status = StatusEnum.MOUNTED
    if (app.name === opts.appName) {
      // ??? 为什么要将app的status置为not_loaded ???
      app.status = StatusEnum.NOT_LOADED
      navigateToApp = app
      return app
    }
  })

  if (navigateToApp) {
    let prefix = navigateToApp.appConfig.prefix
    // 向浏览器的历史记录中添加一条新纪录，同时改变地址栏的地址内容
    // 参数：1、用于描述新纪录的一些特性，供以后使用
    //      2、新页面的标题，一般情况下该参数会被浏览器忽略
    //      3、新页面的相对地址
    history.pushState(null, '', prefix + '/' + opts.router)
    // ??? reRouter的作用是 ???
    return window.mooa.instance.reRouter()
  }
}

export function hashCode(str: string) {
  let hash = 0
  if (str.length === 0) {
    return hash.toString()
  }
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)   //charCodeAt(i) 返回 str[i] 字符对应的Unicode编码
    hash = hash & hash
    hash = hash >>> 1
  }

  return hash.toString()
}
