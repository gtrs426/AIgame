import {
  _decorator,
  Component,
  Node,
  Vec2,
  v2,
  Prefab,
  instantiate,
  Label,
  director,
  UITransform,
  Color,
} from "cc";
import { Ball } from "./Ball";
import { tgxEasyController, tgxEasyControllerEvent } from "../core_tgx/tgx";
import { Paddle } from "./Paddle";

const { ccclass, property } = _decorator;

@ccclass("PongController")
export class PongController extends Component {
  // 声明属性
  @property(Label)
  scoreLabel: Label = null;

  @property(Node)
  ball: Node;

  @property(Node)
  paddle: Node;

  private _score: number = 0;
  private _gameOver: boolean = false;
  // 明确声明球事件回调方法
  public onBallHit: () => void = () => {
    this._score++;
    console.log("球被击中，得分+1");
    if (this.scoreLabel) {
      this.scoreLabel.string = "得分: " + this._score;
    }
  };
  public onBallDrop: () => void = () => {
    this._gameOver = true;
    console.log("球掉落");
  };
  start() {
    // 初始化游戏
    this.startGame();
    // 监听控制器事件
    tgxEasyController.on(tgxEasyControllerEvent.BUTTON, this.onStart, this);
  }

  startGame() {
    if (!this._gameOver) return;
    this._gameOver = false;
    // 1.重置得分
    this._score = 0;
    if (this.scoreLabel) {
      this.scoreLabel.string = "得分: 0";
    }
    // 2.重置球位置
    const ball = this.ball.getComponent("Ball") as Ball;
    if (ball) {
      ball.reset();
    }

    // 3.重置挡板位置
    const paddle = this.paddle.getComponent("Paddle") as Paddle;
    if (paddle) {
      paddle.reset();
    }
  }

  onStart(btnSlot: string) {
    if (btnSlot === "btn_slot_0") {
      this.startGame();
    }
  }

  onDestroy() {
    // 清理事件监听
    tgxEasyController.off(tgxEasyControllerEvent.BUTTON, this.onStart, this);
  }
}
