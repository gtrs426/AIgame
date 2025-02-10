import {
  _decorator,
  Component,
  Node,
  Vec2,
  v2,
  BoxCollider2D,
  RigidBody2D,
  director,
  IPhysics2DContact,
} from "cc";
import { PongController } from "./PongController";

const { ccclass, property } = _decorator;

@ccclass("Ball")
export class Ball extends Component {
  private _velocity: Vec2;
  start() {
    this.reset();
  }

  reset() {
    // 重置位置到场景中心
    this.node.setPosition(0, -315);
    let rigidBody2D = this.node.getComponent(RigidBody2D); // Get the RigidBody2D component
    if (rigidBody2D) {
      rigidBody2D.applyLinearImpulse(
        new Vec2(1, 1),
        new Vec2(this.node.position.x, this.node.position.y),
        true
      );
    } else {
      console.warn("RigidBody2D component not found!");
    }
  }
  private _lastHitFrame: number = 0;
  onBeginContact(contact: IPhysics2DContact, selfCollider: BoxCollider2D, otherCollider: BoxCollider2D) {
    // 防止同一帧多次触发
    if (director.getTotalFrames() === this._lastHitFrame) return;

    if (otherCollider.node.name === "paddle") {
      // 触发得分
      //小球被paddle借助反弹一次得1分
      const gameController = this.node.parent.getComponent(PongController);
      if (gameController) {
        gameController.onBallHit();
        this._lastHitFrame = director.getTotalFrames();
        console.log("[物理] 挡板有效碰撞，计分+1");
      }

      // 添加速度随机变化（±5度）
      const angleVariation = ((Math.random() - 0.5) * 10 * Math.PI) / 180;
      const currentAngle = Math.atan2(this._velocity.y, this._velocity.x);
      const newAngle = currentAngle + angleVariation;

      const speed = this._velocity.length();
      this._velocity.x = Math.cos(newAngle) * speed;
      this._velocity.y = Math.sin(newAngle) * speed;
    }
  }

  update(dt: number) {
    //小球如果y坐标小于paddle的y坐标那就是掉落了
    const pos = this.node.position;
    if (pos.y < 0) {
      // 假设屏幕底部为0
      const gameController = this.node.parent.getComponent(PongController);
      if (gameController) {
        gameController.onBallDrop();
      }
    }
  }

  onDestroy() {}
}
