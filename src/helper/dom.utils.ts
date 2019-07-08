import { hashCode, navigateAppByName } from './app.helper'
import { MooaApp } from '../model/IAppOption'
import { MOOA_EVENT } from '../model/constants'

declare const Element: any
declare const document: Document

export function createApplicationContainer(mooaApp: MooaApp) {
  const opts = mooaApp.appConfig
  let el: any = document.querySelector(opts.selector)
  if (mooaApp.switchMode === 'coexist') {
    if (el) {
      el.style.display = 'block'
      return el
    }
  }

  el = document.createElement(opts.selector)

  if (opts.parentElement) {
    let parentEl = document.querySelector(opts.parentElement)
    if (parentEl) {
      parentEl.appendChild(el)
    } else {
      document.body.appendChild(el)
    }
  } else {
    document.body.appendChild(el)
  }

  return el
}

export function removeApplicationContainer(app: MooaApp) {
  const opts = app.appConfig
  let el: any = document.querySelector(opts.selector)
  if (!el) {
    return
  }

  if (app.switchMode === 'coexist') {
    el.style.display = 'none'
    return
  }

  if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  }

  return el.remove()
}

// 返回是否创建iFrame
export function isIframeElementExist(mooaApp: MooaApp) {
  return document.getElementById(generateIFrameID(mooaApp.appConfig.name))
}

export function isElementExist(appName: string): any {
  return document.querySelector(`app-${appName}`)
}

/**
 * 创建iframe容器
 * 首先需要判断该app的展示形式是否为与其他app共存
 *  如果共存(coexist)，且已经创建过ifrmae，则将样式置为可见(block)
 *  如果不共存，则新建iframe
 */
export function createApplicationIframeContainer(mooaApp: MooaApp) {
  const opts = mooaApp.appConfig
  if (mooaApp.switchMode === 'coexist') {
    let iframeElement: any = isIframeElementExist(mooaApp)
    if (iframeElement) {
      iframeElement.style.display = 'block'
      return iframeElement
    }
  }

  const iframe: any = document.createElement('iframe')
  iframe.frameBorder = ''
  iframe.width = '100%'
  iframe.height = '100%'
  iframe.src = window.location.origin + '/assets/iframe.html'
  iframe.id = generateIFrameID(mooaApp.appConfig.name)

  // 此处是判断iframe的位置，如果配置文件中指定了iframe的parentElement，则将iframe插入到父元素里面
  // 否则插入到body下
  if (opts.parentElement) {
    let parentEl = document.querySelector(opts.parentElement)
    if (parentEl) {
      parentEl.appendChild(iframe)
    }
  } else {
    document.body.appendChild(iframe)
  }

  // 创建一个app标签
  const el = document.createElement(opts.selector)

  let iframeEl: any = document.getElementById(iframe.id)
  // contentWindow属性返回<iframe>元素的window对象。你可以使用这个window对象来访问iframe的文档及其内部DOM。contentWindow为只读，但是可以像操作全局window对象一样操作其他属性
  iframeEl.contentWindow.document.write('<div></div>')  // 像文档中写入一个div标签
  iframeEl.contentWindow.document.body.appendChild(el)  //将创建好的app标签插入body中
  iframeEl.contentWindow.document.head.innerHTML =
    iframeEl.contentWindow.document.head.innerHTML + "<base href='/' />" // ??? 插入这个base标签的用途在哪???
  iframeEl.contentWindow.mooa = {     //以对象字面量的形式初始话iframe中的window.mooa
    isSingleSpa: true
  }
  // 在iframe中监听路由变化的事件
  iframeEl.contentWindow.addEventListener(MOOA_EVENT.ROUTING_NAVIGATE, function(
    event: CustomEvent
  ) {
    if (event.detail) {
      navigateAppByName(event.detail)
    }
  })
}

export function removeApplicationIframeContainer(app: MooaApp) {
  const iframeId = generateIFrameID(app.appConfig.name)
  let iframeEl = document.getElementById(iframeId)
  if (!iframeEl) {
    return
  }

  if (app.switchMode === 'coexist') {
    iframeEl.style.display = 'none'
    return
  }

  if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
      if (iframeEl && iframeEl.parentNode) {
        iframeEl.parentNode.removeChild(iframeEl)
      }
    }
  }

  return iframeEl.remove()
}
// 生成iframeID
export function generateIFrameID(name: string) {
  return name + '_' + hashCode(name)  // app name + 根据name生成的key
}
