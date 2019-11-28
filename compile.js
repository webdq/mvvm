class Compile{
    constructor(el, vm){
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        //把节点内容放到内存中
        let fragment = this.node2fragment(this.el);
        //编译模板，替换节点中的内容
        this.compile(fragment);
        //把内容塞到页面中
        this.el.appendChild(fragment);
    }
    compileElement(node){
        let attributes = node.attributes;
        [...attributes].forEach(attr => {
            let {name, value} = attr;
            if(this.isDirective(name)){
                let [,directive] = name.split('-');
                let [directiveName, eventName] = directive.split(':');
                CompileUtil[directiveName](node, value, this.vm, eventName);
            }
        })
    }
    compileText(node){
        let content = node.textContent;
        let reg = /\{\{(.+?)\}\}/;
        if(reg.test(content)){
            CompileUtil['text'](node, content, this.vm);
        }
    }
    compile(node){
        let childNodes = node.childNodes;
        [...childNodes].forEach(child => {
            if(this.isElementNode(child)){
                //元素节点
                this.compileElement(child);
                //递归编译
                this.compile(child);
            }else{
                //文本节点
                this.compileText(child);
            }
        })
    }
    node2fragment(el){
        let fragment = document.createDocumentFragment();
        let firstChild;
        while(firstChild = el.firstChild){
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    isElementNode(node){
        return node.nodeType === 1;
    }
    isDirective(name){
        return name.startsWith('v-');
    }
}

CompileUtil = {
    setValue(vm, expr, value){
        return expr.split('.').reduce((data, current, index, arr)=>{
            if(index === arr.length - 1){
                return data[current] = value;
            }
            return data[current];
        }, vm.$data);
    },
    getTextValue(vm, expr){
        return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getExprValue(vm, args[1]);
        })
    },
    getExprValue(vm, expr){
        //根据表达式取到值
        return expr.split('.').reduce((data,current) => {
            return data[current];
        }, vm.$data);
    },
    model(node, expr, vm, eventName){
        let fn = this.updater['modelUpdater'];
        new Watcher(vm, expr, (newValue) => {
            fn(node, newValue);
        })
        //添加监听事件
        node.addEventListener('input',(e) => {
            let value = e.target.value;
            this.setValue(vm, expr, value);
        })
        let value = this.getExprValue(vm, expr);
        fn(node,value);
    },
    html(node, expr, vm){
        let fn = this.updater['htmlUpdater'];
        new Watcher(vm, expr, (newValue) => {
            fn(node, newValue);
        })
        let value = this.getExprValue(vm, expr);
        fn(node, value);
    },
    text(node, expr, vm){
        let fn = this.updater['textUpdater'];
        let value = this.getTextValue(vm, expr);
        expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            new Watcher(vm, args[1], (newValue) => {
                console.log(args[1]);
                fn(node, this.getTextValue(vm, expr));
            })
        });
        fn(node, value);
    },
    on(node, expr, vm, eventName){
        node.addEventListener(eventName, (e) => {
            vm[expr].call(vm, e);
        })
    },
    updater: {
        modelUpdater(node, value){
            node.value = value;
        },
        htmlUpdater(node, value){
            node.innerHTML = value;
        },
        textUpdater(node, value){
            node.textContent = value;
        }
    }
}