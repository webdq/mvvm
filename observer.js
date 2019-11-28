class Observer{
    constructor(data){
        this.observer(data);
    }
    observer(data){
        if(data && typeof data === 'object'){
            for(let key in data){
                this.defineReactive(data, key, data[key]);
                this.observer(data[key]);
            }
        }
    }
    defineReactive(obj, key, value){
        //this.observer(value);
        let dep = new Dep();
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            get(){
                Dep.target && dep.add(Dep.target);
                return value;
            },
            set:(newValue)=>{
                if(newValue != value){
                    this.observer(newValue);
                    value = newValue;
                    dep.notify();
                }
            }
        })
    }
}

class Dep{
    constructor(){
        this.subs = [];
    }
    add(watcher){
        this.subs.push(watcher);
    }
    notify(){
        this.subs.forEach(watcher => {
            watcher.update();
        })
    }
}