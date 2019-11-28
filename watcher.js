class Watcher {
    constructor(vm, expr, cb){
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        this.oldValue = this.getValue();
    }
    getExprValue(vm, expr){
        //根据表达式取到值
        return expr.split('.').reduce((data,current) => {
            return data[current];
        }, vm.$data);
    }
    getValue(){
        Dep.target = this;
        var value = this.getExprValue(this.vm, this.expr);
        Dep.target = null;
        return value;
    }
    update(){
        let newValue = this.getExprValue(this.vm, this.expr);
        if(this.oldValue !== newValue){
            this.cb(newValue);
        }
    }
}