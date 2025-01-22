import { _decorator, Component, Animation, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HitEffect')
export class HitEffect extends Component {
    start() {
        this.scheduleOnce(()=>{
            let uiOpacity = this.node.getComponent(UIOpacity);
            tween(uiOpacity).to(1.0,{opacity:0}).start();
        },3.0);
    }

    update(deltaTime: number) {
        
    }
}


