axios.interceptors.response.use(function (response) {
    let {config: {url, method, data}} = response
    data = JSON.parse(data || '{}')
    let row = {
        id: 1, name: 'JavaScript高级程序设计', number: 2
    }
    if (url === '/books/1' && method === 'get') {
        response.data = row
    } else if (url === '/books/1' && method === 'put') {
        response.data = Object.assign(row, data)
    }
    return response
})


class Model {
    constructor(options) {
        // 公共数据
        this.data = options.data || {}
        this.resource = options.resource
        this.baseUrl = options.baseUrl || '/'
    }

    // 公共方法
    fetch(id) {
        return axios.get(this.baseUrl + this.resource + 's/' + id)
            .then(({data}) => {
                this.data = data
            })
    }

    create(data) {
        return axios.post(this.baseUrl + this.resource + 's', data)
            .then(({data}) => {
                this.data = data
            })
    }

    destroy() {
        let id = this.data.id
        return axios.delete(this.baseUrl + this.resource + 's/' + id)
            .then(() => {
                this.data = {}
            })
    }

    update(newData) {
        let id = this.data.id
        return axios.put(this.baseUrl + this.resource + 's/' + id, newData)
            .then(({data}) => {
                this.data = data;
            })
    }
}

class View {
    constructor({el, template}) {
        this.el = el
        this.$el = $(el)
        this.template = template
    }

    render(data) {
        let html = this.template
        for (let key in data) {
            let value = data[key]
            html = html.replace(`__${key}__`, value)
        }
        this.$el.html(html)
    }
}

class Controller {
    constructor({view, model, events, init, ...rest}) {
        this.view = view
        this.model = model
        this.events = events
        Object.assign(this, rest)
        this.bindEvents()
        this.view.render(this.model.data)
        init.apply(this, arguments)
    }

    bindEvents() {
        this.events.map((e) => {
            this.view.$el.on(e.type, e.el, this[e.fn].bind(this))
        })
    }
}

// view,model,controller 由用户传入，M,V,C 三个类仅保留公共数据字段及方法。
var model = new Model({
    resource: 'book',
    data: {
        id: null,
        number: 0,
        name: null
    }
})

var view = new View({
    el: '#app',
    template: `
<div>
  书名：《__name__》，
  数量：__number__
</div>
<div class="actions">
  <button id="increaseByOne">加1</button>
  <button id="decreaseByOne">减1</button>
  <button id="square">平方</button>
  <button id="cube">立方</button>
  <button id="reset">归零</button>
</div>
  `,
})

var controller = new Controller({
    view: view,
    model: model,
    events: [
        {type: 'click', el: '#increaseByOne', fn: 'add'},
        {type: 'click', el: '#decreaseByOne', fn: 'minus'},
        {type: 'click', el: '#square', fn: 'square'},
        {type: 'click', el: '#cube', fn: 'cube'},
        {type: 'click', el: '#reset', fn: 'reset'}
    ],
    init(options) {

        this.model.fetch(1)
            .then(() => {
                this.view.render(this.model.data)
            })
    },
    add() {
        let newData = {number: this.model.data.number + 1}
        this.updateModel(newData)
    },
    minus() {
        // 注意这里有 bug
        this.model.data.number = this.model.data.number - 1
        this.updateModel(this.model.data)
    },
    square() {
        let newData = {number: Math.pow(this.model.data.number, 2)}
        this.updateModel(newData)
    },
    cube() {
        let newData = {number: Math.pow(this.model.data.number, 3)}
        this.updateModel(newData)
    },
    reset() {
        this.updateModel({number: 0})
    },
    updateModel(newData) {
        this.model.update(newData).then(() => {
            this.view.render(this.model.data)
        })
    }
})