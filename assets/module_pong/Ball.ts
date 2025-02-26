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
  Contact2DType,
} from "cc";
import { PongController } from "./PongController";

const { ccclass, property } = _decorator;

@ccclass("Ball")
export class Ball extends Component {
  private _startVelocity = v2(5, 5);
  private _collider: BoxCollider2D = null!;
  private _drop = false;
  private _startY = -315;
  start() {
    this.reset();
  }

  // 在Ball.ts的onLoad方法添加组件检查
  onLoad() {
    this._collider = this.getComponent(BoxCollider2D);
    console.log(
      `碰撞体存在：${!!this._collider}，启用状态：${this._collider?.enabled}`
    );
    const rigidbody = this.getComponent(RigidBody2D);
    console.log(`刚体存在：${!!rigidbody}，类型：${rigidbody?.type}`);
    // 注册碰撞回调
    this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    this._collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
  }

  reset() {
    // 重置位置到场景中心
    this._drop = false;
    this.node.setPosition(0, this._startY);
    let rigidBody2D = this.node.getComponent(RigidBody2D);
    if (rigidBody2D) {
      // 重置刚体状态
      rigidBody2D.linearVelocity = this._startVelocity;
      rigidBody2D.angularVelocity = 0;
      rigidBody2D.enabled = true;
    } else {
      console.error("Ball重置失败：未找到RigidBody2D组件");
    }
  }
  private _lastHitFrame: number = 0;
  onBeginContact(
    selfCollider: BoxCollider2D,
    otherCollider: BoxCollider2D,
    contact: IPhysics2DContact | null
  ) {
    if (otherCollider.node.name === "paddle") {
      const curHitFrame = director.getTotalFrames();
      console.log(
        "上次碰撞帧:" +
        this._lastHitFrame +
        "当前碰撞帧:" +
        curHitFrame +
        "碰撞间隔:" +
        (curHitFrame - this._lastHitFrame) +
        "碰撞间隔大于1帧"
      );
      if (curHitFrame > this._lastHitFrame) {
        this._lastHitFrame = curHitFrame;
        //小球被paddle借助反弹一次得1分
        const gameController = this.node.parent.getComponent(PongController);
        if (gameController) {
          gameController.onBallHit();
          console.log("挡板有效碰撞，计分+1");
        }
      }
    }
  }
  onEndContact(
    selfCollider: BoxCollider2D,
    otherCollider: BoxCollider2D,
    contact: IPhysics2DContact | null
  ) {
    if (otherCollider.node.name === "paddle") {
      console.log("碰撞结束:" + otherCollider.node.name);
      let rigidBody2D = this.node.getComponent(RigidBody2D); // Get the RigidBody2D component
      if (rigidBody2D) {
        // 获取当前速度并增加随机角度变化
        const currentVelocity = rigidBody2D.linearVelocity.clone();
        const angleVariation = ((Math.random() * 10 - 5) * Math.PI) / 180; // ±15度变化
        const newAngle = Math.atan2(currentVelocity.y, currentVelocity.x) + angleVariation;
        const speed = currentVelocity.length() * 1.05; // 每次加速5%
        // 碰撞后改变速度
        const newVelocity = v2(
          Math.cos(newAngle) * speed,
          Math.sin(newAngle) * speed
        );
        rigidBody2D.linearVelocity = newVelocity;
        console.log(
          `速度更新：${newVelocity.x.toFixed(1)}, ${newVelocity.y.toFixed(1)}`
        );
      }
    }
  }

  update(dt: number) {
    //小球如果y坐标小于paddle的y坐标那就是掉落了
    const pos = this.node.position;
    if (!this._drop && pos.y < this._startY) {
      this._drop = true;
      let rigidBody2D = this.node.getComponent(RigidBody2D); // Get the RigidBody2D component
      if (rigidBody2D) {
        rigidBody2D.enabled = false; //禁用物理模拟
      }
      const gameController = this.node.parent.getComponent(PongController);
      if (gameController) {
        gameController.onBallDrop();
      }
    }
  }

  onDestroy() {
    // 移除碰撞回调
    this._collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    this._collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
  }
}
