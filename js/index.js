const salaryOneHour = document.querySelector('#salary')
// 天数 ui 类
class DayUI {
  constructor(startTime, endTime, day, flag) {
    this.day = day
    this.startTime = startTime
    this.endTime = endTime
    if (!flag) return
    MonthUI.monthList[0].addDayUI(this)
  }
  /**
   * 计算每天时长
   */
  calculateTotalTime() {
    const start = this.startTime.split(':')
    const end = this.endTime.split(':')
    let hour = 0
    // 判断是否工作到凌晨
    if (parseInt(end[0]) >= parseInt(start[0])) {
      hour = parseInt(end[0]) - parseInt(start[0])
    } else {
      hour = parseInt(end[0]) + 24 - parseInt(start[0])
    }
    let minute = 0
    if (parseInt(end[1]) >= parseInt(start[1])) {
      minute = (parseInt(end[1]) - parseInt(start[1])) / 60
    } else {
      hour -= 1
      minute = (parseInt(end[1]) + 60 - parseInt(start[1])) / 60
    }
    return hour + minute
  }
  /**
   * 计算每天的工资
   */
  calculateTotlaSalary() {
    return this.calculateTotalTime() * salaryOneHour.value
  }
  /**
   * 修改 开始时间 和 结束时间
   * @param {Date} startTime 
   * @param {Date} endTime 
   */
  setTime(startTime, endTime) {
    this.startTime = startTime
    this.endTime = endTime
  }

  static objToDayUI(obj) {
    const dayUI = new DayUI(obj.startTime, obj.endTime, obj.day, false)
    return dayUI
  }
}

// 月份 ui 类
class MonthUI {
  static monthList = []
  constructor(year, month, dayUIList, flag) {
    this.year = year
    this.month = month
    this.dayUIList = dayUIList
    if (!flag) return
    this.addToMonthList()
  }
  /**
   * 添加到 monthList 中
   */
  addToMonthList() {
    MonthUI.monthList.unshift(this)
  }
  /**
   * 添加 DayUI对象
   * @param {*} dayUI 
   */
  addDayUI(dayUI) {
    this.dayUIList.unshift(dayUI)
  }
  /**
   * 计算总时长
   */
  calculateTotalTime() {
    return (this.dayUIList.reduce((prev, current) => prev + current.calculateTotalTime(), 0)).toFixed(2)
  }
  /**
   * 计算总工资
   */
  calculateTotlaSalary() {
    return (this.dayUIList.reduce((prev, current) => prev + current.calculateTotlaSalary(), 0)).toFixed(2)
  }
  static objToMonthUI(obj) {
    const monthUI = new MonthUI(obj.year, obj.month, obj.dayUIList, false)
    return monthUI
  }
}

// ui 类
class UI {
  constructor() {
    // 关心话语
    this.readSalaryOneHour()
    const data = JSON.parse(localStorage.getItem('data'))
    if (data) UI.objToData(data)
    this.doms = {
      addBtn: document.querySelector('.add-btn'),
      dataBox: document.querySelector('.data-box'),
      formContainer: document.querySelector('.form-container'),
      closeBtn: document.querySelector('.close'),
      cofirmBtn: document.querySelector('.cofirm-btn'),
      startTime: document.querySelector('#start-time'),
      endTime: document.querySelector('#end-time'),
      tip: document.querySelector('.tip')
    }
    this.showTip('欢迎回家~')
    this.listern()
    this.render()
  }
  /**
   * 监听事件
   */
  listern() {
    // 添加按钮的点击事件
    this.doms.addBtn.addEventListener('click', () => this.doms.formContainer.classList.add('show'))
    // 关闭按钮的点击事件
    this.doms.closeBtn.addEventListener('click', () => this.doms.formContainer.classList.remove('show'))
    // 确定按钮的点击事件
    this.doms.cofirmBtn.addEventListener('click', () => {
      if (this.doms.startTime.value === '' || this.doms.endTime.value === '') return this.showTip('时间不可以为空哦')
      this.createMonthUI()
      new DayUI(this.doms.startTime.value, this.doms.endTime.value, new Date().getDate(), true)
      this.saveToLocalStorage()
      this.doms.startTime.value = ''
      this.doms.endTime.value = ''
      this.doms.formContainer.classList.remove('show')
    })
    // 每小时工资改动的事件
    salaryOneHour.addEventListener('change', () => {
      localStorage.setItem('salaryOneHour', salaryOneHour.value)
    })
    // 点击删除按钮的事件
    this.doms.dataBox.addEventListener('click', (e) => {
      if (e.target.className.includes('edit-btn')) {
        MonthUI.monthList[e.target.dataset.monthindex].dayUIList.splice(e.target.dataset.dayindex, 1)
        this.saveToLocalStorage()
      }
    })
  }
  /**
   * 从本地存储中读取工资数据
   */
  readSalaryOneHour() {
    const salary = localStorage.getItem('salaryOneHour')
    if (salary) {
      salaryOneHour.value = localStorage.getItem('salaryOneHour')
    }
  }
  /**
   * 展示提示词
   * @param {String} message 提示词
   */
  showTip(message) {
    this.doms.tip.textContent = message
    this.doms.tip.classList.add('show')
    setTimeout(() => this.doms.tip.classList.remove('show'), 5000)
  }
  /**
   * 创建 MonthUI 对象
   */
  createMonthUI() {
    const date = new Date()
    if (!MonthUI.monthList[0] || (date.getMonth() + 1) !== MonthUI.monthList[0].month) return new MonthUI(date.getFullYear(), date.getMonth() + 1, [], true)
  }
  /**
   * 保存 monthList 到本地存储中
   */
  saveToLocalStorage() {
    localStorage.setItem('data', JSON.stringify(MonthUI.monthList))
    this.render()
  }
  /**
   * obj转data
   */
  static objToData(obj) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = MonthUI.objToMonthUI(obj[i])
      const length = obj[i].dayUIList.length
      for (let j = 0; j < length; j++) {
        obj[i].dayUIList[j] = DayUI.objToDayUI(obj[i].dayUIList[j])
      }
    }
    // 保存6个月的数据
    if (obj.length > 5) {
      obj.splice(obj.length - 1, 1)
      localStorage.setItem('data', obj)
    }
    MonthUI.monthList = obj
  }
  /**
   * 渲染
   */
  render() {
    let htmlStr = ''
    for (let i = 0; i < MonthUI.monthList.length; i++) {
      const dataMonth = MonthUI.monthList[i]
      htmlStr += `<div class="data-month">
        <h3 class="date">${dataMonth.year} 年 ${dataMonth.month} 月</h3>`
      for (let j = 0; j < dataMonth.dayUIList.length; j++) {
        const dataDay = dataMonth.dayUIList[j]
        htmlStr += `<div class="data-day">
          <div class="text">${dataDay.day} 号</div>
          <div class="time">${dataDay.startTime} - ${dataDay.endTime}</div>
          <button data-monthindex="${i}" data-dayindex="${j}" class="edit-btn">删除</button>
        </div>`
      }
      htmlStr += `<div class="footer">
        <div class="total-time">总时长：<em class="num">${dataMonth.calculateTotalTime()}</em> 小时</div>
        <div class="total-salary">总工资：<em class="num">${dataMonth.calculateTotlaSalary()}</em> 元</div>
      </div>
    </div>`
    }
    this.doms.dataBox.innerHTML = htmlStr
  }
}

const ui = new UI()