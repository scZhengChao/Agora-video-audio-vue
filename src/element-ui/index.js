import {Button,Input,Select,Option,Checkbox,Notification,Loading,Message} from 'element-ui'
export default {
  install:function(Vue){
    Vue.use(Button)
    Vue.use(Input)
    Vue.use(Select)
    Vue.use(Option)
    Vue.use(Checkbox)
    Vue.prototype.$notify = Notification
    Vue.use(Loading.directive)
    Vue.prototype.$message = Message
  }
}