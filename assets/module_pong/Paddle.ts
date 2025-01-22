import { _decorator, Component, Node, Vec2, v2, Prefab, Vec3 } from 'cc';
import { EasyController, EasyControllerEvent } from '../core_tgx/easy_controller/EasyController';
const { ccclass, property } = _decorator;

const tempV2 = v2();

@ccclass('Paddle')
export class Paddle extends Component {
    @property
    moveSpeed: number = 100;

    @property
    needRotation: boolean = false;

    @property(Node)
    leftWall: Node;

    @property(Node)
    rightWall: Node;

    private _minX: number = -650;
    private _maxX: number = 650;

    start() {
        EasyController.on(EasyControllerEvent.MOVEMENT, this.onMovement, this);
        EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
    }

    private _moveFactor: number = 0;
    private _moveDir: Vec2 = v2(1, 0);

    public get moveDir(): Vec2 {
        return this._moveDir;
    }

    public get realSpeed(): number {
        return this.moveSpeed * this._moveFactor;
    }

    onMovement(degree, strengthen) {
        let angle = degree / 180 * Math.PI;
        if (this.needRotation) {
            this.node.setRotationFromEuler(0, 0, degree);
        }
        this._moveDir.set(Math.cos(angle), Math.sin(angle));
        this._moveDir.normalize();
        this._moveFactor = strengthen;
    }

    onMovementStop() {
        this._moveFactor = 0;
    }

    onDestroy() {
        EasyController.off(EasyControllerEvent.MOVEMENT, this.onMovement, this);
        EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
    }


    update(deltaTime: number) {
        if (this._moveFactor) {
            Vec2.multiplyScalar(tempV2, this._moveDir, this.realSpeed * deltaTime);
            let pos = this.node.position;
            let newX = pos.x + tempV2.x;
            if (newX < this._minX) {
                newX = this._minX;
            } else if (newX > this._maxX) {
                newX = this._maxX;
            }
            this.node.setPosition(newX, pos.y, pos.z);
        }
    }
}