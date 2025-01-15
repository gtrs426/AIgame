import { _decorator, Component, Node, v3, Vec3, Vec2, v2, Prefab, instantiate, tween } from 'cc';
import { tgxCharacterMovement2D, tgxEasyController, tgxEasyControllerEvent } from '../core_tgx/tgx';
import { Food } from './Food';
import { SnakeGameAudioMgr } from './SnakeGameAudioMgr';

const { ccclass, property } = _decorator;

const tempV2 = v2();

@ccclass('SnakeController')
export class SnakeController extends Component {
    @property(Prefab)
    food: Prefab;

    @property(Node)
    firePoint: Node;

    @property(Node)
    barrel: Node;

    private _movement2d: tgxCharacterMovement2D;

    start() {
        tgxEasyController.on(tgxEasyControllerEvent.BUTTON, this.onButtonHit, this);

        this._movement2d = this.node.getComponent(tgxCharacterMovement2D);
    }

    private _isFiring = false;

    onButtonHit(btnSlot: string) {
        if (btnSlot == 'btn_slot_0') {
            if (this._isFiring) {
                return;
            }
            this._isFiring = true;
            let food = instantiate(this.food);
            this.node.parent.addChild(food);
            food.setWorldPosition(this.firePoint.worldPosition);
            food.setWorldRotation(this.node.worldRotation);
            food.getComponent(Food).moveDir = this._movement2d.moveDir;

            SnakeGameAudioMgr.playOneShot('sounds/sfx_shoot', 1.0);

            //animation
            let oldPosX = this.barrel.position.x;
            tween(this.barrel).to(0.05, { position: v3(oldPosX - 10, 0, 0) })
                .then(tween(this.barrel).to(0.2, { position: v3(oldPosX, 0, 0) })).call(() => {
                    this._isFiring = false;
                })
                .start();
        }
    }

    onDestroy() {
        tgxEasyController.off(tgxEasyControllerEvent.BUTTON, this.onButtonHit, this);
    }
}


