* noodle.js
> 未优化代码

* MVC.js（MVC 设计模式）
> 将代码按 MVC 分类

* OO.js（面向对象设计模式）
> 抽离出公共数据/方法，封装成类。

* Event.js（发布订阅/设计模式）
> 使用事件机制，减少回调函数。
```
// Model
update(newData) {
let id = this.data.id
return axios.put(this.baseUrl + this.resource + 's/' + id, newData)
  .then(({data})=>{ 
    this.data = data; 
  })
}

// 在调用 Model 的 update 方法后"手动添加"一个回调函数
this.model.update(newData).then(()=>{
  this.view.render(this.model.data)
})
```
变为
```
// Model
update(newData) {
let id = this.data.id
return axios.put(this.baseUrl + this.resource + 's/' + id, newData)
  .then(({data})=>{ 
    this.data = data; 
    this.emit('changed') // 会触发 this.view.render(this.model.data)
  }) 
}

// 在调用 Model 的 update 方法后不必手动多添加一个回调函数
updateModel(newData) {
    this.model.update(newData).then(()=>{
      this.view.render(this.model.data)
    })
}
```

#### Render 的 bug
> 如果每次 render 都会更新 #app 的 innerHTML，这可能会丢失用户的写在页面某个 input 里面的数据。这有两个解决办法：
1. 用户只要输入了什么，就记录在 JS 的 data 里。（双向绑定：Angluar）
```
// 监听页面上的 data-input 内容
data-input.on('input',()=>{

    // 将 data-input 内容实时记录在 model 中
    this.model.updateInputContent()
})

// 在 render 时，将 InputContent 填充到页面的 data-input 中。给用户"data-input 内容不曾丢失"的错觉
this.view.render(this.model.InputContent,data-input)
```
2. 不要粗暴的更新页面全部元素，而是只更新需要更新的部位（单向绑定：虚拟 DOM 的初步思想出现了）


#### Vue 的由来
1. Vue 代替了 View，这就是 Vue 的名字和其读音的来历。
2. Vue 扩展出了足以代替 Mode,Controller 的功能。于是我们不再需要 MVC,只需要 Vue
3. 在 Vue2.2 中，Vue 做到了 react 做到的事情：实现了局部更新。


#### Vue 的双向绑定
* 只有 UI 组件（UI数据）有双向绑定的需要（input/cascader/button），因为这样真的很便利。非 UI 组件（用户数据）没有双向绑定的需要。
* Vue 的双向绑定（也是 Angular 的双向绑定）有这些功能：
    * 只要 JS 改变了 view.n, HTML 就会局部更新（js=>HTML，即内存=>DOM）
    * 只要用户在 input 里输入了值，JS 里的 view.n 就会更新。（HTML=>js，，即DOM=>内存）
    ```
    Object.defineProperty,setter 实现
    ```
* 双向绑定的缺陷在于，由于双向绑定只能局限于一个组件（跨组件双向绑定会带来额外的复杂度，因此不考虑），那么多个组件间的数据同步就会产生问题
> 比如我们的项目中有如下两个组件,那么用户在 <input type="password"/> 中修改密码后，只有 userPassword.vue 响应改变。于是就会造成两个组件的 password 不一致。
```
// userName.vue
<input type="text"/>
data=()=>{
    return {
        userName:
        password:
    }
}

// userPassword.vue
<input type="password"/>
data=()=>{
    return {
        userName:
        password:
    }
}
```  
> 而实际开发中，多个组件间又不可避免地存在共享数据。双向绑定在这方面表现出了局限性

#### React 的单向绑定
> 与 Vue 不同，一开始 React 就坚定地执行单向数据绑定。
* 受控组件
> react 哲学：UI=f(state)。state 不变，则 UI 不变（说白了就是单向数据流，UI不可以自己变化，只能由 state 映射）
```
// 当用户在 input 内输入内容时，不会首先触发 UI 的重新渲染。而是先调用 onChangeContent 改变状态 name，再根据 UI 与 state 的映射关系渲染 UI
const [name,setName]=useState('libai')
const onChangeContent=(e)=>{
    setName(e.target.value)
}
<input type="text" value={name} onChange={onChangeContent}/>
```



#### 【面试】单向绑定的要点
1. redux
2. virtual DOM
> site:zhihu.com Virtual DOM
 
#### 【面试】双向绑定的要点
> 主要问实现方式。关键在于 js=>html 的部分，即框架怎么判断更新UI数据的时机到了。
* Angular.js 
使用 Dirty Checking
```
// html=>js
input 事件实现

// js=>html
$Http.get(fn) // 在 fn 后会调用 render,check 哪些地方进行了更新，然后重新渲染
```
* Vue 
    * 使用 getter setter，缺点是无法监听不存在的属性
    ```
    var data={}
    var _name=input.content
    Object.defineProperty('data','name',{
        get(){return _name}
        set(value){_name=value;updateInputContent(_name)}
    })
    ```
    * 使用 $set()
    ```
    <div id="app">
      {{user.name}}
      {{user.age}}
      <button @click="addUserAgeField">增加一个年纪字段</button>
    </div>
    ```
    ```
    const app = new Vue({
      el: "#app",
      data: {
          user: {
              name: 'test'
          }
      },
      methods: {
          addUserAgeField () {
               // this.user.age = 20 无效，不作响应
               this.$set(this.user, 'age', 20) // 响应新增属性
         }
      }
    }
    ```
    * Vue 3 计划使用 proxy，只要 this.user.age = 20 即可响应新增属性
    ```
    var data={
    name:'libai'
    }
    // dataProxy 就是 data 的代理
    var dataProxy=new Proxy(data,{
        get(target,key){
            return data[key]
        },
        set(target,key,value){
            data[key]=value
        }
    })

    console.log(dataProxy.name) // 'libai'
    dataProxy.name='jack' // 更新 name
    dataProxy.age=12 // 新增属性 age
    console.log(dataProxy.age) // 12
    ```


#### 后端的 MVC
* 专门操作 MySQL 数据库的代码
* 专门渲染 HTML 的代码
* 其他控制逻辑的代码（用户请求首页之后去读数据库，然后渲染 HTML 作为响应等等）

#### 前端的 MVC
* 专门操作远程数据的代码（fetchDb 和 saveDb 等等）
> model 只负责存储数据（本地数据）、请求数据、更新数据
* 专门呈现页面元素的代码（innerHTML 等等）
> view 只负责渲染 HTML（可接受一个 data 来定制数据）
* 其他控制逻辑的代码（点击某按钮之后做啥的代码，即UI交互逻辑等）
> controller 负责调度 model 和 view
