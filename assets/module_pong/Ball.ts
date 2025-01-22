import { _decorator, Component, Node, Vec2, v2, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { PongController } from './PongController';
import { PongGameAudioMgr } from './PongGameAudioMgr';

const { ccclass, property } = _decorator;

@ccclass('Ball')
export class Ball extends Component {
    @property({ tooltip: '初始速度（像素/秒）' })
    initialSpeed: number = 100;

    @property({ tooltip: '最大速度（像素/秒）' })
    maxSpeed: number = 600;

    @property({ tooltip: '每次碰撞加速比例' })
    speedIncreaseRate: number = 1.1;

    private _velocity: Vec2 = v2();
    private _collider: Collider2D = null;

    start() {
        // 初始化碰撞组件
        this._collider = this.getComponent(Collider2D);
        if (this._collider) {
            this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        this.reset();
    }

    reset() {
        // 重置位置到场景中心
        this.node.setPosition(-315, 0);
        // 生成30°~150°的随机角度（转换为弧度）并确保向右方向
        const angle = (Math.random() * 120 + 30) * Math.PI / 180;
        this._velocity = v2(
            Math.sin(angle) * this.initialSpeed,
            -Math.cos(angle) * this.initialSpeed
        );
    }

    //小球如果y坐标小于paddle的y坐标那就是掉落了

    //小球被paddle借助反弹一次得1分

    update(dt: number) {
        // 更新球的位置
        const pos = this.node.position;
        this.node.setPosition(
            pos.x + this._velocity.x * dt,
            pos.y + this._velocity.y * dt,
            pos.z
        );

        // 检查是否掉落到底部
        if (pos.y < -400) { // 假设屏幕底部为-400
            const gameController = this.node.parent.getComponent(PongController);
            if (gameController) {
                gameController.onBallDrop();
            }
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 播放碰撞音效
        PongGameAudioMgr.playOneShot('sounds/hit', 1.0);

        // 根据碰撞调整球的方向
        const normal = contact.getManifold()!.localNormal.clone().normalize();
        const reflection = v2(
            this._velocity.x - 2 * normal.x * (this._velocity.x * normal.x + this._velocity.y * normal.y),
            this._velocity.y - 2 * normal.y * (this._velocity.x * normal.x + this._velocity.y * normal.y)
        );

        // 如果碰到挡板，增加分数
        if (otherCollider.node.name === 'paddle') {
            const gameController = this.node.parent.getComponent(PongController);
            if (gameController) {
                gameController.onBallHit();
            }

            // 稍微增加速度
            const currentSpeed = Math.sqrt(this._velocity.x * this._velocity.x + this._velocity.y * this._velocity.y);
            const newSpeed = Math.min(currentSpeed * this.speedIncreaseRate, this.maxSpeed);
            const speedRatio = newSpeed / currentSpeed;

            this._velocity = v2(
                reflection.x * speedRatio,
                reflection.y * speedRatio
            );
        } else {
            // 普通反弹
            this._velocity = reflection;
        }
    }

    onDestroy() {
        // 清理事件监听
        if (this._collider) {
            this._collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
}
