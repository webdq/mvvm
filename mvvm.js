class Vue{
    constructor(options){
        this.$options = options;
        this.$el = options.el;
        this.$data = options.data;
        let computed = options.computed;
        let methods = options.methods;
        if(this.$el) {
            //数据劫持
            new Observer(this.$data);
            //代理
            this.proxyComputed(computed);
            this.proxyMethods(methods);
            this.proxyData(this.$data);
            //编译模板
            new Compile(this.$el, this);
        }
    }
    proxyMethods(methods){
        for(let key in methods){
            Object.defineProperty(this, key, {
                get:()=>{
                    return methods[key];
                }
            })
        }
    }
    proxyComputed(computed){
        for(let key in computed){
            Object.defineProperty(this.$data, key, {
                get:()=>{
                    return computed[key].call(this);
                }
            })
        }
    }
    proxyData(data){
        for(let key in data){
            Object.defineProperty(this, key, {
                get(){
                    return data[key];
                },
                set(newValue){
                    data[key] = newValue;
                }
            })
        }
    }
}