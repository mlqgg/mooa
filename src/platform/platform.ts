import { customEvent } from '../helper/app.helper'
import { MOOA_EVENT } from '../model/constants'

declare const window: any
window.mooa = window.mooa || {}

export class MooaPlatform {
  name: string = ''
  router: any

  mount(name: string, router?: any) {
    this.name = name
    this.router = router
    return new Promise((resolve, reject) => {
      if (this.isSingleSpaApp()) {
        customEvent(MOOA_EVENT.CHILD_MOUNT, { name: this.name })  // 触发挂载child_mount事件
        window.mooa[this.name] = window.mooa[this.name] || {}     //将app挂载到window
        window.mooa[this.name].mount = (props: any) => {
          resolve({ props, attachUnmount: this.unmount.bind(this) })
        }
      } else {
        resolve({ props: {}, attachUnmount: this.unmount.bind(this) })
      }
    })
  }

  unmount(module: any) {
    if (this.isSingleSpaApp()) {
      customEvent(MOOA_EVENT.CHILD_UNMOUNT, { name: this.name }) //触发移除事件
      window.mooa[this.name].unmount = () => {
        if (module) {
          module.destroy()
          if (this.router) {
            module.injector.get(this.router).dispose()
          }
        }
      }
    }
  }

  appBase(): string {
    if (this.isSingleSpaApp()) {
      const pathNames = window.location.pathname.split('/')
      if (pathNames.length < 2) {
        return '/'
      }
      const parentRouter = pathNames[1]
      const appName = pathNames[2]
      const locationPath = '/' + parentRouter + '/' + appName
      window.mooa.basePath = locationPath
      return locationPath
    } else {
      return '/'
    }
  }

  navigateTo(opts: any) {
    customEvent(MOOA_EVENT.ROUTING_NAVIGATE, opts)  //触发路由跳转，用于在不同app之间进行切换
  }

  handleRouterUpdate(router: any, appName: string) {
    window.addEventListener(MOOA_EVENT.ROUTING_CHANGE, (event: CustomEvent) => {
      /** 
       * 此处监听路由改变事件,
       * 自定义事件customEvent里面的event需要参数detail
       * {
       *  app:{
       *      name:"xxx"
       *  },
       *  url: "xxxxx"
       * }
      */
      if (event.detail.app.name === appName) {    
        let urlPrefix = 'app'
        if (urlPrefix) {   // ??? urlPrefix上面刚刚定义过，肯定不为false呀，为什么要做这个判断？？？
          urlPrefix = `/${window.mooa.option.urlPrefix}/`
        }
        router.navigate([event.detail.url.replace(urlPrefix + appName, '')])  // ??? 将路由导向哪里 ???
      }
    })
  }

  private isSingleSpaApp(): boolean {
    return window.mooa.isSingleSpa
  }
}

export default MooaPlatform
